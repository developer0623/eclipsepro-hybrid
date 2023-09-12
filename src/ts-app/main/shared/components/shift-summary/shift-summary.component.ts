import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shift-summary',
  templateUrl: './shift-summary.component.html',
  styleUrls: ['./shift-summary.component.scss']
})
export class ShiftSummaryComponent {
  @Input() shiftStats;
  @Input() machineState;

}
