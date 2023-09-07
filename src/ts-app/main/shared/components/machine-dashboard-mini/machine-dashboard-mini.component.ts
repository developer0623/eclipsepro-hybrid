import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-machine-dashboard-mini',
  templateUrl: './machine-dashboard-mini.component.html',
  styleUrls: ['./machine-dashboard-mini.component.scss']
})
export class MachineDashboardMiniComponent implements OnChanges {
  @Input() machine;
  @Input() metricDefinitions;
  @Input() renderUnlicensed;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('111111111', changes);
  }

}
