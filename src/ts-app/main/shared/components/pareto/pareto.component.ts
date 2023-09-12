import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { UnitsService } from '../../services/units.service';

@Component({
  selector: 'app-pareto',
  templateUrl: './pareto.component.html',
  styleUrls: ['./pareto.component.scss']
})
export class ParetoComponent implements OnChanges {
  @Input() name = 'name';
  @Input() value = 'value';
  @Input() occurances = 'occurances';
  @Input() topItems = 0;
  @Input() barWidth = 100;
  @Input() barHeight = 20;
  @Input() data = [];
  @Input() type;
  units;
  vm;

  constructor(private unitsService: UnitsService, public media: MediaObserver) {
    this.units = this.type;
  }

  calculateParetoVm() {
    // Create a standardized data array using the provided accessor names
    let tempValues = this.data.map((o) => { return { name: o[this.name], value: o[this.value], occurances: o[this.occurances] }; });
    //console.log(tempValues);
    // Sort the array by descending value
    /*global _ */
    _.sortBy(tempValues, (o) => { return -1 * o.value; });

    // Initialize the view model
    let vm = [];
    let other = { count: 0, total: 0, combinedNames: '' };
    this.units = this.unitsService.getUserUnits(this.type);

    for (let i = 0; i < tempValues.length; i++) {
      let newValue: any = tempValues[i];
      if (newValue.value < 0) {
        continue;
      }
      newValue.value = this.unitsService.convertUnits(newValue.value, this.type, 1, this.units);
      if (i < this.topItems) {
        //todo:format from service for ffi&fdi?
        newValue.toolTipText = newValue.value.toFixed(1) + ' ' + this.units;
        vm.push(newValue);
        //console.log(newValue);
      }
      else {
        other.total += newValue.value;
        other.count++;
        if (other.combinedNames !== '') {
          other.combinedNames += ', ';
        }
        other.combinedNames += newValue.name + ': ' + newValue.value.toFixed(1);
      }
    }
    if (other.count > 0) {
      vm.push({ name: 'Other (' + other.count + ')', value: other.total, toolTipText: other.combinedNames });
    }

    // Find the max and total value
    let maxValue = Math.max.apply(Math, tempValues.map((o) => { return o.value; }));
    /*global _ */
    // lodash version required by angular-dc doesn't support _sum
    let sumValues = _.reduce(tempValues, (sum, val) => { return sum + val.value; });

    // Add percentages
    vm = vm.map((o) => {
      o.valuePercent = o.value / sumValues;
      o.barPercent = o.value / maxValue;
      return o;
    });

    return vm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue) {
      this.vm = this.calculateParetoVm();
    }
  }
}
