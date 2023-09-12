import { Component, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-bullet-chart',
  templateUrl: './bullet-chart.component.html',
  styleUrls: ['./bullet-chart.component.scss']
})
export class BulletChartComponent implements OnChanges {
  @Input() current;
  @Input() okLower;
  @Input() okUpper;
  @Input() target;
  @Input() minValue;
  @Input() maxValue;
  @Input() lowerBetter;
  @Input() display;
  @Input() type;
  options;

  constructor(@Inject('unitsService') public unitsService) {

    this.options = {
      chart: {
        type: 'bulletChart',
        transitionDuration: 0,
        height: this.display === 'wallboard' ? 40 : 25,
        width: null,
        margin: {
          top: 4,
          right: 4,
          bottom: 4,
          left: 4
        },
        callback: (chart) => {
          if (this.display === 'wallboard') {
            chart.container.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            chart.container.setAttribute('viewBox', '0 0 250 40');
          }
        }
      },
      config: {
        deepWatchData: true
      },
      data: this.calculateBulletVM()
    };

  }

  calculateBulletVM() {
    let data = {};
    let outType = this.unitsService.getUserUnits(this.type);
    let current = this.unitsService.convertUnits(this.current, this.type, 1, outType);
    let okLower = this.unitsService.convertUnits(this.okLower, this.type, 1, outType);
    let okUpper = this.unitsService.convertUnits(this.okUpper, this.type, 1, outType);
    let maxValue = this.unitsService.convertUnits(this.maxValue, this.type, 1, outType);
    let minValue = this.unitsService.convertUnits(this.minValue, this.type, 1, outType);
    let target = this.unitsService.convertUnits(this.target, this.type, 1, outType);

    let ranges = [okLower, okUpper, Math.max(maxValue, current)];
    let measures = [Math.max(current, 0)];
    let markers = [target];
    data = {
      'ranges': ranges,
      'measures': measures,
      'markers': markers,
      'rangeLabels': this.lowerBetter ?
        [
          'Good: ' + minValue + ' - ',
          'Ok: ' + okLower + ' - ',
          'Poor: ' + okUpper + ' - '
        ] :
        [
          'Poor: ' + minValue + ' - ',
          'Ok: ' + okLower + ' - ',
          'Good: ' + okUpper + ' - '
        ],
      'markerLabels': ['Target: '],
      'measureLabels': ['Current: ']
    };
    return data;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.options.data = this.calculateBulletVM();
  }

}
