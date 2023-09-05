import angular from 'angular';
import moment from 'moment';
import { IShiftChoice } from '../../../../../core/dto';

// todo: - add filter for available dates
//       - Show missing shifts in a more visible way, `ng-disabled` is not enough

const ShiftSelect_ = {
  selector: 'shiftSelect',
  bindings: {
    availableShifts: '<',
    shiftIndex: "=",
    updateShiftIndex: "&"
  },
  template: `
<md-button class="md-icon-button" ng-show="!$ctrl.isLast"
    ng-click="$ctrl.moveIndex($ctrl.currentIndex+1); $event.stopPropagation();">
  <md-icon md-font-icon="mdi-chevron-left" class="mdi"></md-icon>
</md-button>

<md-datepicker ng-model="$ctrl.currentDate" ng-change="$ctrl.selectDate()"
  md-hide-icons="triangle">
</md-datepicker><!-- md-date-filter="$ctrl.onlyAllowDate" md-mode="{{ $ctrl.duration }}" md-max-date="$ctrl.startMaxDate"  -->

<md-button ng-repeat="shift in $ctrl.shifts track by $index" class="md-icon-button" 
    ng-click="$ctrl.selectShift(shift.shiftCode); $event.stopPropagation();" 
    ng-disabled="!shift">
  <md-icon md-font-icon="mdi-numeric-{{$index+1}}-box" class="mdi" 
      ng-if="$ctrl.availableShifts[$ctrl.currentIndex].shift === $index+1"></md-icon>
  <md-icon md-font-icon="mdi-numeric-{{$index+1}}-box-outline" class="mdi" 
      ng-if="$ctrl.availableShifts[$ctrl.currentIndex].shift != $index+1"></md-icon>
</md-button>

<md-button class="md-icon-button" ng-show="!$ctrl.isFirst"
    ng-click="$ctrl.moveIndex($ctrl.currentIndex-1); $event.stopPropagation();">
  <md-icon md-font-icon="mdi-chevron-right" class="mdi"></md-icon>
</md-button>
`,
  controller: class ShiftSelect {
    availableShifts: IShiftChoice[];
    currentIndex: number = 0;
    isFirst: boolean = true;
    isLast: boolean = true;
    shifts: (IShiftChoice & {isCurrent:boolean})[] = [undefined, undefined, undefined]
    currentShift: IShiftChoice;
    currentDate: Date;

    updateShiftIndex;
    shiftIndex: number;

    $onChanges() {
      console.log(`shift update from ${this.currentIndex} to ${this.shiftIndex}`)
      this.currentIndex = this.shiftIndex;
      this.refresh();
    }

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
              this.shifts[i] = undefined;
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
      this.updateShiftIndex({shiftIdx: this.currentIndex});
    }

  },
  controllerAs: '$ctrl'
};

export default ShiftSelect_;