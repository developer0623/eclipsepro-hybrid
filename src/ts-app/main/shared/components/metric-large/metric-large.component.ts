import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-metric-large',
  templateUrl: './metric-large.component.html',
  styleUrls: ['./metric-large.component.scss']
})
export class MetricLargeComponent implements OnInit, OnChanges {
  @Input() metric;
  @Input() metricDefinition;
  @Input() currentPrimary;
  @Input() currentSecondary;
  @Input() statsHistory;

  metricClass;

  calcMetricClass() {
    let lowerBetter = this.metricDefinition.lowerIsBetter;

    // Trim K unit from metricValue and convert
    // if (metricValue.includes('K')) {
    //     metricValue = metricValue.slice(0, -1) * 1000;
    // }

    if (this.currentPrimary <= this.metric.okRangeStart) {
       return lowerBetter ? 'lower-better metric-good' : 'metric-bad';
    }
    else if (this.currentPrimary > this.metric.okRangeStart && this.currentPrimary < this.metric.okRangeEnd) {
       return (lowerBetter ? 'lower-better ' : '') + 'metric-ok';
    }
    return lowerBetter ? 'lower-better metric-bad' : 'metric-good';
 };

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('44444444', changes)
  }

  ngOnInit(): void {
    this.metricClass = this.calcMetricClass();
  }

}
