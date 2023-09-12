import { Component, Input, Inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-sparkline',
  templateUrl: './sparkline.component.html',
  styleUrls: ['./sparkline.component.scss']
})
export class SparklineComponent implements OnInit, OnChanges {
  @Input() stats;
  @Input() current;
  @Input() display;
  @Input() type;

  options;
  config = {
    deepWatchData: true
  };

  data;

  constructor(@Inject('unitsService') public unitsService) {

  }

  calculateSparklineVm() {
    let data = [];
    let outType = this.unitsService.getUserUnits(this.type);
    _.sortBy(this.stats, ['shiftCode'])
      .map((item, index) => {
        data.push({
          x: index,
          label: item.shiftCode,
          y: this.unitsService.convertUnits(item.value, this.type, 1, outType)
        });
      });

    data.push({ x: data.length, label: 'Current', y: this.unitsService.convertUnits(this.current, this.type, 1, outType) }); //todo: translate 'current'
    return data;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stats && changes.stats.currentValue) {
      this.data = this.calculateSparklineVm();
    }
  }

  ngOnInit(): void {
    this.options = {
      chart: {
        type: 'sparklinePlus',
        height: this.display === 'wallboard' ? 150 : 50,
        width: null,
        showLastValue: false,
        noData: null,
        margin: {
          top: 20,
          bottom: 0,
          left: 20,
          right: 20
        },
        x: function (d) {
          return d.x;
        },
        y: function (d) {
          return d.y;
        },
        xTickFormat: (d) => {
          return this.data[d].label; //this is not perfect but it is better than before and we now know how to control it.
        },
        callback: (chart) => {
          if (this.display === 'wallboard') {
            chart.container.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            chart.container.setAttribute('viewBox', '0 0 200 150');
          }
        }
      }
    }
  }


}
