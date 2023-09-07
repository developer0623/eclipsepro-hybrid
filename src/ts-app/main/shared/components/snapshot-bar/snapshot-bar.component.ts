import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-snapshot-bar',
  templateUrl: './snapshot-bar.component.html',
  styleUrls: ['./snapshot-bar.component.scss']
})
export class SnapshotBarComponent {
  @Input() running;
  @Input() exempt;
  @Input() changeover;
  @Input() downtime;
  @Input() breakdown;
  @Input() offline;

  total() {
    let result = (this.running || 0) + (this.exempt || 0) + (this.changeover || 0) + (this.downtime || 0) + (this.breakdown || 0) + (this.offline || 0);
    return result;
  }
}
