import { Component, Input } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

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

  constructor(private translate: TranslateService) {


  }

  total() {
    let result = (this.running || 0) + (this.exempt || 0) + (this.changeover || 0) + (this.downtime || 0) + (this.breakdown || 0) + (this.offline || 0);
    return result;
  }

  onGetTooltipContent(field, val) {
    return this.translate.get(field).subscribe((res: string) => {
      return res + val;
  });
  }
}
