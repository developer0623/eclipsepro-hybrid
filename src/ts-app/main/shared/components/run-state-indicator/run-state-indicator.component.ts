import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-run-state-indicator',
  templateUrl: './run-state-indicator.component.html',
  styleUrls: ['./run-state-indicator.component.scss']
})
export class RunStateIndicatorComponent {
  @Input() state;
  @Input() lastRunStateChange;
  @Input() isOffline;
  @Input() isSchedule;
  @Input() isNoPower;
}
