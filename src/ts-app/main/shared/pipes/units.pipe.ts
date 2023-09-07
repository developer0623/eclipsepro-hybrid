import { Pipe, PipeTransform } from '@angular/core';
import { UnitsService } from '../services/units.service';

@Pipe({
  name: 'unitsFormat'
})
export class UnitsFormatPipe implements PipeTransform {
  constructor(private unitsService: UnitsService) {
  }

  transform(input, inType, decimals, hideUnit, shortenTo, outType): unknown {
    if(!shortenTo) {
        return this.unitsService.formatUserUnits(input, inType, decimals, hideUnit, outType);
    }
    else {
        return this.unitsService.shortenBigNumber(input, inType, shortenTo);
    }
  }
}

@Pipe({
  name: 'userDisplayUnits'
})
export class UserDisplayUnitsPipe implements PipeTransform {
  constructor(private unitsService: UnitsService) {
  }

  transform(type): unknown {
    return this.unitsService.getUserDisplayUnits(type);
  }
}

@Pipe({
  name: 'unitsValue'
})
export class UnitsValuePipe implements PipeTransform {
  constructor(private unitsService: UnitsService) {
  }

  transform(input, inType, decimals): unknown {
    if(!input) { return 0; }
    return this.unitsService.convertUnits(input, inType, decimals);
  }
}

@Pipe({
  name: 'taskLenghValue'
})
export class TaskLenghValuePipe implements PipeTransform {
  transform(input): unknown {
    if(!input) { return 0; }
    return Math.round(input);
  }
}
