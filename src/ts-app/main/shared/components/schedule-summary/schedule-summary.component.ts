import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-schedule-summary',
  templateUrl: './schedule-summary.component.html',
  styleUrls: ['./schedule-summary.component.scss']
})
export class ScheduleSummaryComponent {
  @Input() scheduleSummary;
  @Input() shiftStats;

}
