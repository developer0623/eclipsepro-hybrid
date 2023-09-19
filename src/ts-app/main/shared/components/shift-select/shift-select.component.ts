import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import moment from 'moment';
import { IShiftChoice } from 'src/app/core/dto';

@Component({
  selector: 'app-shift-select',
  templateUrl: './shift-select.component.html',
  styleUrls: ['./shift-select.component.scss']
})
export class ShiftSelectComponent implements OnChanges {
  @Input() availableShifts: IShiftChoice[];
  @Input() shiftIndex: number;
  @Output() updateShiftIndex = new EventEmitter<number>();

  currentIndex: number = 0;
  isFirst: boolean = true;
  isLast: boolean = true;
  shifts: (IShiftChoice & {isCurrent:boolean})[] = [undefined, undefined, undefined]
  currentShift: IShiftChoice;
  currentDate: Date;
  repeatShifts = [0, 1, 2];

  refresh() {
    this.isFirst = this.currentIndex === 0;
    this.isLast = this.currentIndex === (this.availableShifts.length - 1);

    this.currentShift = this.availableShifts[this.currentIndex];
    if (this.currentShift){
      this.currentDate = this.currentShift.shiftDate;
      let currentShiftCodeDate = this.currentShift.shiftCode.slice(0,-1);

      for (let i = 0; i < 3; i++) {
        let s = this.availableShifts.findIndex(x=>x.shiftCode === currentShiftCodeDate + (i+1));
        if (s >= 0) {
            this.shifts[i] = {...this.availableShifts[s], isCurrent: this.currentShift.shift === this.availableShifts[s].shift};
        } else {
            this.shifts[i] = null;
        }
      }
    }

  }

  moveIndex(newIndex) {
    this.currentIndex = newIndex;
    this.onShiftIndexChange();
    this.refresh();
  }

  selectShift(shiftCode: string) {
    let s = this.availableShifts.findIndex(x=>x.shiftCode === shiftCode);
    this.currentIndex = s;
    this.onShiftIndexChange();
    this.refresh();
  }

  selectDate() {
    let d = moment(this.currentDate).format('YYYYMMDD');
    let s = this.availableShifts.findIndex(x=>x.shiftCode.slice(0,-1) === d);
    this.currentIndex = s;
    this.onShiftIndexChange();
    this.refresh();
  }

  onShiftIndexChange(){
    this.updateShiftIndex.emit(this.currentIndex);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.currentIndex = this.shiftIndex;
    console.log('2222222', changes, this.availableShifts[this.currentIndex])
    this.refresh();
  }

}
