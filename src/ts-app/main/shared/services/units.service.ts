import { Injectable, Inject } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import Qty from 'js-quantities';
import { IUnitDef } from 'src/app/core/dto';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  currentInchesKey = 'in';
  units = [
    { key: 'in', system: 'imperial', base: 'in', title: 'Inches' },
    {
      key: 'ffi',
      system: 'imperial',
      base: 'in',
      title: 'Feet Fractional Inch',
    },
    {
      key: 'fdi',
      system: 'imperial',
      base: 'in',
      title: 'Feet Decimal Inch',
    },
    { key: 'ft', system: 'imperial', base: 'in', title: 'Feet' },
    { key: 'mm', system: 'metric', base: 'in', title: 'Millimeter' },
    { key: 'cm', system: 'metric', base: 'in', title: 'Centimeter' },
    { key: 'm', system: 'metric', base: 'in', title: 'Meter' },
    { key: 'ft', system: 'imperial', base: 'ft', title: 'Feet' },
    { key: 'm', system: 'metric', base: 'ft', title: 'Meter' },
    { key: 'fpm', system: 'imperial', base: 'fpm', title: 'Feet/Minute' },
    { key: 'mpm', system: 'metric', base: 'fpm', title: 'Meter/Minute' },
    { key: 'lbs', system: 'imperial', base: 'lbs', title: 'Pounds' },
    { key: 'kg', system: 'metric', base: 'lbs', title: 'Kilograms' },
  ];

  constructor(@Inject('clientDataStore') public clientDataStore) {
    clientDataStore.SelectSystemPreferences()
      .subscribe(sysprefs => {
        this.currentInchesKey = sysprefs.inchesUnit;
      });
  }

    // This returns the list of units that are equiv to
    getBaseUnits() {
      let baseUnits = [];
      for (let i = 0; i < this.units.length; i++) {
        if (this.units[i].base === 'in') {
          baseUnits.push({
            key: this.units[i].key,
            title: this.units[i].title,
          });
        }
      }
      return baseUnits;
    }

    formatUserUnits(
      input: number,
      inType: string,
      decimals: number,
      hideType: boolean = false,
      outType: string = '',
      ignoreSpecialInches: boolean = false
    ): string {
      if (!input && input !== 0) {
        return '';
      } //if undefined or NaN (null?) but no 0
      if (!decimals || decimals < 0) {
        decimals = 0;
      }

      if (inType === '%') {
        return (
          this.round(input * 100, decimals).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
          }) + (hideType ? '' : '%')
        );
      }
      if (inType === 'min') {
        return (
          this.round(input, decimals).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
          }) + (hideType ? '' : ' min')
        ); //todo:i18n
      }
      if (inType === '') {
        return input + '';
      }

      if (!outType || outType === '') {
        outType = this.getUserUnits(inType);
      }
      return this.formatUnits(input, inType, outType, decimals, hideType, ignoreSpecialInches);
    }

    formatUnits(
      input: number,
      inType: string,
      outType: string,
      decimals: number,
      hideType: boolean,
      ignoreSpecialInches: boolean
    ): string {
      //sanitize inputs
      if (!input) {
        input = 0;
      }
      if (!decimals || decimals < 0) {
        decimals = 0;
      }

      if (inType === outType) {
        return (
          this.round(input, decimals).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
          }) + (hideType ? '' : ' ' + outType)
        );
      }

      if (ignoreSpecialInches && (outType === 'fdi' || outType === 'ffi')) {
        outType = 'in';
      }

      //special formats
      switch (outType) {
        case 'fdi':
          return this.inToFdi(input);
        case 'ffi':
          return this.inToFfi(input);
        case 'mpm':
          let mpm = this.fpmToMpm(input);
          return mpm + (hideType ? '' : ' ' + outType);
      }

      //the rest can just use the js-quantity conversion
      let inputQty = new Qty(`${input}${inType}`);
      let outQty = inputQty.to(outType);
      return (
        this.round(outQty.scalar, decimals).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
        }) + (hideType ? '' : ' ' + outType)
      );
    }

    convertUnits(
      input: number,
      inType: string,
      decimals: number,
      outType: string = ''
    ): number {
      if (!input) {
        return 0;
      }
      if (!decimals || decimals < 0) {
        decimals = 0;
      }
      if (inType === '%') {
        return this.round(input * 100, decimals);
      }
      if (inType === 'min') {
        return this.round(input, decimals);
      }

      if (!outType) {
        outType = this.getUserUnits(inType);
      }

      if (inType === outType) {
        return this.round(input, decimals);
      }

      // Normalize types for `Qty` conversion.
      switch (outType) {
        case 'ffi':
        case 'fdi': //currently, there is no way this would be anything other than inches on both sides
          // outType = 'in';
          // break;
          return this.round(input, decimals);
        case 'mpm':
          outType = 'm';
          break;
        case 'fpm':
          outType = 'ft';
          break;
      }
      switch (inType) {
        case 'mpm':
          inType = 'm';
          break;
        case 'fpm':
          inType = 'ft';
          break;
      }

      let inputQty = new Qty(`${input}${inType}`);
      let outQty = inputQty.to(outType);
      return this.round(outQty.scalar, decimals);
    }

    //todo:move to shared math library?
    round(input: number, decimals: number): number {
      let pow = Math.pow(10, decimals);
      let rounded = Math.round(input * pow) / pow;
      if (Math.sign(rounded) === -0) return 0; // fucking javascript
      return rounded;
    }

    inToFfi(input: number): string {
      //ported from vfp DecToFFIn
      let neg = input < 0;
      let length = Math.abs(input);
      let feet = Math.floor(length / 12);
      let inches = Math.floor(length - feet * 12);
      let dec = length - feet * 12 - inches;
      // BigNumber will throw if it's input has more than 15 significant digits
      let x = new BigNumber(dec.toFixed(15));
      let fraction = x.toFraction(64);

      let result = neg ? '-' : '';
      if (feet > 0) {
        result += feet + "' ";
      }
      result += inches;
      if (dec > 0) {
        result += '-' + fraction[0] + '/' + fraction[1];
      }
      result += '"';

      return result;
    }

    inToFdi(input: number): string {
      let neg = input < 0;
      let length = Math.abs(input);
      let feet = Math.floor(length / 12);
      let inches = length - feet * 12;

      let result = neg ? '-' : '';
      if (feet > 0) {
        result += feet + "' ";
      }
      result += inches + '"';

      return result;
    }

    fpmToMpm(input: number): number {
      let inputQty = new Qty(`${input}ft`);
      let outQty = inputQty.to('m');
      //let pow = Math.pow(10,decimals);
      //let rounded = Math.round(outQty.scalar*pow)/pow;
      let rounded = Math.round(outQty.scalar);
      return rounded;
    }

    shortenBigNumber(
      input: number,
      inType: string,
      decimals: number
    ): string {
      if (input === null) {
        return '';
      }
      if (input === 0) {
        return '0';
      }

      input = this.convertUnits(input, inType, decimals, undefined); //not sure id decimals is correct here

      let abs = Math.abs(input);
      let rounder = Math.pow(10, decimals);
      let isNegative = input < 0;
      let key = '';
      let powers = [
        { key: 'Q', value: Math.pow(10, 15) },
        { key: 'T', value: Math.pow(10, 12) },
        { key: 'B', value: Math.pow(10, 9) },
        { key: 'M', value: Math.pow(10, 6) },
        { key: 'K', value: 1000 },
      ];

      for (let i = 0; i < powers.length; i++) {
        let reduced = abs / powers[i].value;
        reduced = Math.round(reduced * rounder) / rounder;
        if (reduced >= 1) {
          abs = reduced;
          key = powers[i].key;
          break;
        }
      }
      return (isNegative ? '-' : '') + abs + key;
    }

    getUserUnitDef(type: string): IUnitDef {
      if (type === '' || type === 'min' || type === '%' || type === 'ga') {
        // Not a convertible unit type. Just return something benign
        return { key: type, system: 'imperial', base: 'type', title: type };
      }

      let systemBaseUnitKey = this.currentInchesKey;
      let systemUnit = {
        key: 'in',
        system: 'imperial',
        base: 'in',
        title: 'Inches',
      };

      for (let i = 0; i < this.units.length; i++) {
        if (this.units[i].key === systemBaseUnitKey) {
          systemUnit = this.units[i];
          break;
        }
      }

      if (type === systemUnit.base) {
        return systemUnit;
      }

      for (let j = 0; j < this.units.length; j++) {
        if (
          this.units[j].base === type &&
          this.units[j].system === systemUnit.system
        ) {
          return this.units[j];
        }
      }

      //didn't find a conversion. Give up.
      // should this be considered an exception?
      console.log('no conversion for unit:' + type);
      return { key: type, system: 'imperial', base: 'type', title: type };
    }

    getUserUnits(type: string, ignoreSpecialInches?: boolean): string {
      let unitType = this.getUserUnitDef(type);
      if ((unitType.key === 'ffi' || unitType.key === 'fdi') && ignoreSpecialInches) {
        return 'in';
      }
      return unitType.key;
    }

    getUserDisplayUnits(type: string): string {
      if (type === '%') {
        return '%';
      }
      let userType = this.getUserUnits(type);
      switch (userType) {
        case 'ffi':
          return '';
        case 'fdi':
          return '';
      }
      return userType;
    }

    getUserFromSystem(value: number, unit: string): number {
      // todo: support more base types and more generic rounding
      if (unit === 'ft') {
        return this.convertUnits(value, 'ft', 0);
      }
      return value;
    }

    getSystemFromUser(
      userValue: number,
      unit: string,
      unitsService
    ): number {
      // todo: support more base types and more generic rounding
      if (unit === 'ft') {
        return this.convertUnits(userValue, this.getUserUnits('ft'), 3, 'ft');
      }
      return userValue;
    }
}
