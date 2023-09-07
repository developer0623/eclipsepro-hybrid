import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lockout-indicator',
  templateUrl: './lockout-indicator.component.html',
  styleUrls: ['./lockout-indicator.component.scss']
})
export class LockoutIndicatorComponent {
  @Input() lockout;
}
