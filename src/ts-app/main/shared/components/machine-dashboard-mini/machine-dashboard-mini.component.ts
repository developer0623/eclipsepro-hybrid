import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-machine-dashboard-mini',
  templateUrl: './machine-dashboard-mini.component.html',
  styleUrls: ['./machine-dashboard-mini.component.scss']
})
export class MachineDashboardMiniComponent {
  @Input() machine;
  @Input() metricDefinitions;
  @Input() renderUnlicensed;
}
