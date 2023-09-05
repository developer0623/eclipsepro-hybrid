import angular from 'angular';
import * as moment from 'moment';
import 'moment-duration-format';
import * as _ from 'lodash';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { FreshProductionSummary } from '../../../../core/services/clientData.actions';
import { AppService } from '../../../../core/services/appService';
import { IApiResolverService } from "../../../../reference";

import {
  MaterialUsageGroup
} from '../report-type';
import { IMachine, IProductionSummaryReportRecord } from '../../../../core/dto';

import ProductionSummaryTemplate from './production-summary.html';
import { PrintDialogController } from '../components/print-dialog/print-production-dialog';
import PrintDialogTemp from '../components/print-dialog/print-production-dialog.component.html';

const ProductionSummaryReport_ = {
  selector: 'productionSummaryReport',
  bindings: {},
  template: ProductionSummaryTemplate,
  /** @ngInject */
  controller: ['$mdPanel', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', class ProductionSummaryReportComponent {
    _mdPanel;
    summaryList: MaterialUsageGroup[];
    machines: (IMachine & { isChecked: boolean })[];
    allMachineItem: { name: string; isChecked: boolean };
    endDate: { date: moment.Moment; isOpen: boolean };
    startDate: { date: moment.Moment; isOpen: boolean };
    startMaxDate: Date;
    endMaxDate: Date;
    durations = [
      { title: 'Day', selected: true },
      { title: 'Week', selected: false },
      { title: 'Month', selected: false },
      { title: 'Custom', selected: false },
    ];
    selectedDuration: { title: string; selected: boolean } = this.durations[0];
    machineSub_: Rx.IDisposable;
    selectedMachinesNum: number;
    reportSubscription_: Rx.IDisposable;
    factoryName: string;
    customSelectedDuration: 'days' | 'weeks' | 'months';
    durationLength: number;
    reportFilterSubject$: Rx.BehaviorSubject<{
      startDate?: moment.Moment;
      endDate?: moment.Moment;
      duration?: string;
      customDurationLength?: number;
      customDuration?: string;
      selectedMeasure?: { title: string; selected: boolean };
      machines?: number[];
      shifts?: number[];
      measure?: { title: string; selected: boolean };
    }>;
    calType: string;
    custEndDate: moment.Moment;
    custStartDate: moment.Moment;
    constructor(
      $mdPanel,
      private $mdDialog,
      clientDataStore: ClientDataStore,
      apiResolver: IApiResolverService,
      appService: AppService,
      private $location
    ) {
      this._mdPanel = $mdPanel;

      this.summaryList = [];
      this.machines = [];

      this.allMachineItem = { name: 'All', isChecked: true };

      const machineObs = clientDataStore
        .SelectMachines()
        .filter(ms => ms && ms.length > 0)
        .map(ms => _.sortBy(ms, m => m.description));

      this.machineSub_ = machineObs.subscribe(machines => {
        this.machines = machines.map(m =>
          Object.assign(m, { isChecked: true })
        );
        this.selectedMachinesNum = machines.length;
      });

      this.reportSubscription_ = Rx.Observable.combineLatest(
        clientDataStore.SelectProductionSummaryReport(),
        machineObs,
        (data, machines) => {
          let newiTems = [];
          machines.forEach((machine: any) => {
            if (machine.isChecked) {
              let item = data.find(r => machine.id === r.id);
              newiTems.push(
                Object.assign({}, item, { machineName: machine.description })
              );
            }
          });
          return newiTems;
        }
      ).subscribe(summaries => {
        this.summaryList = summaries;
      });

      clientDataStore
        .Selector(state => state.SystemPreferences)
        .subscribe(prefs => {
          this.factoryName = prefs.plantName;
        });

      this.endDate = { date: moment(), isOpen: false };
      this.startDate = { date: moment(), isOpen: false };

      //set duration from query string 1st and local storage 2nd
      let duration = $location.search().duration;
      if (!duration) {
        duration = localStorage.getItem('report.prodSum.Duration');
      }
      if (duration) {
        let newDuration = this.durations.find(f => f.title === duration);
        if (newDuration) {
          this.selectedDuration.selected = false;
          newDuration.selected = true;
          this.selectedDuration = newDuration;
          this.initDate();
        }
      }

      let qStartDate = $location.search().startDate;
      if (qStartDate) {
        let startMoment = moment(qStartDate);
        if (startMoment.isValid) {
          this.startDate.date = startMoment;
          //do we need to actually read the endDate on anything that is not Custom?
          this.calculateEndDate(startMoment);
        }
      }

      this.reportFilterSubject$ = new Rx.BehaviorSubject({
        startDate: this.startDate.date,
        endDate: this.endDate.date,
        duration: this.selectedDuration.title,
      });

      this.reportFilterSubject$
        // This let's us change a single member on the current filter, leaving any others intact.
        .scan((last: any, next) => Object.assign(last, next))
        .do(query => {
          appService.setLoading(true);
          this.updateQueryString(query);
        })
        .map(query =>
          Rx.Observable.fromPromise(
            apiResolver.resolve<IProductionSummaryReportRecord[]>(
              'history.productionSummary@get',
              {
                ...query,
                // A moment object serializes to a string with "s. Weird. So, we
                // serialize the string manually.
                startDate: query.startDate.format('YYYY-MM-DD'),
                endDate: query.endDate
                  .clone()
                  // Also get the entire last day.
                  // .add(1, 'days') //don't get the entire last day, the server is doing that
                  .format('YYYY-MM-DD'),
              }
            )
          )
        )
        .switch()
        .subscribe(summaryData => {
          appService.setLoading(false);
          clientDataStore.Dispatch(new FreshProductionSummary(summaryData));
        });
    }

    private calculateEndDate(startDate) {
      this.startDate.date = moment(startDate);
      if (this.selectedDuration.title === 'Week') {
        let newDate = this.startDate.date.clone().add(6, 'days');
        this.endDate.date = newDate;
      } else if (this.selectedDuration.title === 'Month') {
        let newDate = this.startDate.date
          .clone()
          .add(this.startDate.date.daysInMonth() - 1, 'days');
        this.endDate.date = newDate;
      } else if (this.selectedDuration.title === 'Custom') {
        let newDate;
        if (this.customSelectedDuration === 'days') {
          newDate = this.startDate.date
            .clone()
            .add(this.durationLength - 1, this.customSelectedDuration);
        } else {
          newDate = this.startDate.date
            .clone()
            .add(this.durationLength, this.customSelectedDuration);
          newDate = newDate.clone().add(-1, 'Days');
        }
        this.endDate.date = newDate;
      } else {
        this.endDate.date = this.startDate.date;
      }
    }

    private initDate() {
      const today = moment();
      this.calType = 'day';
      switch (this.selectedDuration.title) {
        case 'Week': {
          const dayWeek = today.weekday() % 7;
          this.startDate.date = today.clone().add(dayWeek * -1, 'days');
          this.endDate.date = today.clone().add(6 - dayWeek, 'days');
          break;
        }
        case 'Month':
          const dayMonth = today.date();
          const month = today.daysInMonth();
          this.startDate.date = today.clone().add(dayMonth * -1 + 1, 'days');
          this.endDate.date = today.clone().add(month - dayMonth, 'days');
          this.calType = 'month';
          break;
        case 'Custom':
          this.startDate.date = today;
          this.endDate.date = today;
          this.customDate.startDate = today;
          this.customDate.endDate = today;
          this.durationLength = 1;
          this.customSelectedDuration = 'days';
          break;
        default: {
          this.startDate.date = today;
          this.endDate.date = today;
          break;
        }
      }
    }

    onClickMachineMenuItem = item => {
      //still needs to adjust visable list
      if (item.name === 'All') {
        this.allMachineItem.isChecked = !this.allMachineItem.isChecked;
        this.checkedAllMachines(this.allMachineItem.isChecked);
      } else {
        item.isChecked = !item.isChecked;
        if (item.isChecked) {
          this.selectedMachinesNum++;
        } else {
          this.selectedMachinesNum--;
        }

        this.allMachineItem.isChecked =
          this.selectedMachinesNum === this.summaryList.length;
      }
      this.reportFilterSubject$.onNext({
        machines: this.machines
          .filter(x => x.isChecked)
          .map(m => m.machineNumber),
      });
    };

    isAllMchinesIndeterminate = () => {
      if (
        this.selectedMachinesNum > 0 &&
        this.selectedMachinesNum < this.summaryList.length
      ) {
        return true;
      }

      return false;
    };

    checkedAllMachines = flag => {
      this.machines.map(machine => {
        machine.isChecked = flag;
      });
      if (flag) {
        this.selectedMachinesNum = this.summaryList.length;
      } else {
        this.selectedMachinesNum = 0;
      }
    };

    onClickDurationItem = (ev, item) => {
      this.selectedDuration.selected = false;
      item.selected = true;
      this.selectedDuration = item;
      this.initDate_();
      if (item.title !== 'Custom')
        // for now, don't persist custom durations
        localStorage.setItem('report.prodSum.Duration', item.title);
    };

    private updateQueryString(query) {
      const deleteProperty = (key, { [key]: _, ...newObj }) => newObj;

      //todo: start supporting custom dates
      //get rid of custom properties in the query string
      let exportQuery = deleteProperty(
        'customDuration',
        deleteProperty('customDurationLength', query)
      );
      exportQuery = Object.assign({}, exportQuery, {
        startDate: query.startDate.format('YYYY-MM-DD'),
        endDate: query.endDate.format('YYYY-MM-DD'),
      });

      // for now, we can remove the endDate also. It will go back for Custom durations
      exportQuery = deleteProperty('endDate', exportQuery);
      this.$location.search(exportQuery);
    }

    initDate_ = () => {
      this.initDate();
      this.reportFilterSubject$.onNext({
        startDate: this.startDate.date,
        endDate: this.endDate.date,
        duration: this.selectedDuration.title,
      });
    };

    // select startdate on calendar
    onChangeStartDate = () => {
      this.calculateEndDate(this.startDate.date);
      this.reportFilterSubject$.onNext({
        startDate: this.startDate.date,
        endDate: this.endDate.date,
        duration: this.selectedDuration.title,
      });
    };

    // next and prev button
    onChangeDate = step => {
      let skip = 0;
      let newDate;
      if (this.selectedDuration.title === 'Week') {
        skip = 7;
        newDate = this.startDate.date.clone().add(step * skip, 'days');
      } else if (this.selectedDuration.title === 'Month') {
        if (step > 0) {
          newDate = this.endDate.date.clone().add(step, 'days');
        } else if (step < 0) {
          skip = this.startDate.date.clone().add(step, 'days').daysInMonth();
          newDate = this.startDate.date.clone().add(step * skip, 'days');
        }
      } else if (this.selectedDuration.title === 'Custom') {
        newDate = this.startDate.date
          .clone()
          .add(this.durationLength * step, this.customSelectedDuration);
      } else {
        skip = 1;
        newDate = this.startDate.date.clone().add(step * skip, 'days');
      }

      this.startDate.date = newDate;
      this.onChangeStartDate();
    };

    shiftMenuTitle = 'All';
    shiftMenu = [
      { name: 1, isChecked: true },
      { name: 2, isChecked: true },
      { name: 3, isChecked: true },
    ];

    onClickShiftMenuItem = item => {
      item.isChecked = !item.isChecked;
      this.reportFilterSubject$.onNext({
        shifts: this.shiftMenu.filter(x => x.isChecked).map(x => x.name),
      });
      this.getShiftMenuTitle();
    };

    getShiftMenuTitle = () => {
      let count = 0;
      this.shiftMenu.map(menu => {
        if (menu.isChecked && !count) {
          this.shiftMenuTitle = menu.name.toString();
          count++;
        } else if (menu.isChecked && count) {
          this.shiftMenuTitle += ` & ${menu.name}`;
          count++;
        }
      });

      if (count === this.shiftMenu.length) {
        this.shiftMenuTitle = 'All';
      }
    };

    measureMenu = [
      { title: 'Length', selected: true },
      { title: 'Area', selected: false },
      { title: 'Weight', selected: false },
    ];
    selectedMeasure = this.measureMenu[0];

    onClickMeasureItem = (ev, item) => {
      this.selectedMeasure.selected = false;
      item.selected = true;
      this.selectedMeasure = item;
      this.reportFilterSubject$.onNext({ measure: this.selectedMeasure });
    };

    customDate = {
      startDate: moment(),
      endDate: moment(),
      duration: new Date(),
      isOpen: false,
    };
    customDurations = ['days', 'weeks', 'months'];

    onOpenCal = () => {
      if (this.selectedDuration.title === 'Custom') {
        this.customDate.isOpen = true;
      } else {
        this.startDate.isOpen = true;
      }
    };

    onClickCustomDuration = () => {
      this.startDate.date = moment(this.customDate.startDate);
      if (this.customSelectedDuration === 'days') {
        this.customDate.endDate = this.startDate.date
          .clone()
          .add(this.durationLength - 1, this.customSelectedDuration);
      } else {
        let newDate = this.startDate.date
          .clone()
          .add(this.durationLength, this.customSelectedDuration);
        this.customDate.endDate = newDate.clone().add(-1, 'days');
      }
    };

    onClickStartDate = () => {
      this.onClickCustomDuration();
    };

    onClickEndDate = () => {
      this.custEndDate = moment(this.customDate.endDate);
      this.custStartDate = moment(this.customDate.startDate);
      let diff =
        this.custEndDate.dayOfYear() - this.custStartDate.dayOfYear() + 1;
      if (diff < 0) {
        if (this.custStartDate.isLeapYear()) {
          this.durationLength = 366 + diff;
        } else {
          this.durationLength = 365 + diff;
        }
      } else {
        this.durationLength = diff;
      }
      this.customSelectedDuration = 'days';
    };

    onCancelCustomDate = () => {
      this.customDate.isOpen = false;
    };

    onApplyCustomDate = () => {
      this.startDate.date = moment(this.customDate.startDate);
      this.endDate.date = moment(this.customDate.endDate);
      this.customDate.isOpen = false;
      this.reportFilterSubject$.onNext({
        startDate: this.startDate.date,
        endDate: this.endDate.date,
        customDurationLength: this.durationLength,
        customDuration: this.customSelectedDuration,
      });
    };

    onlyAllowDate = date => {
      let day = date.getDay();
      if (this.selectedDuration.title === 'Week') {
        return day === 0;
      }

      return true;
    };

    //todo: localize the help
    headers = {
      good: {
        index: 0,
        title: 'Total GOOD',
        description:
          'Total amount of good production by finished length or weight as well as the total number of good parts. These totals include parts that were originally good as well as those reclaimed from previously reported scrap.<br/><br/>Calculation: sum(number of good parts * finished part length)',
      },
      scrap: {
        index: 1,
        title: 'Net SCRAP',
        description:
          'Total amount of material consumed that did not end up as a good part. This includes bad parts as well as scrap caused by manual shears, coil thread-up & tail-out, etc. <br/><br/>Note: for some products the length of material consumed does not equal the finished part length. In those cases the total good length plus total net scrap will not add up to match the total length consumed. <br/><br/>Calculation: sum(material consumed) - sum(number of good parts * expected material consumed/part)',
      },
      throughput: {
        index: 2,
        title: 'RUNNING THROUGHPUT',
        description:
          'Average production rate when the machine is running. <br/><br/>Calculation: sum(Good product) / sum(Run minutes)',
      },
      oee: {
        index: 3,
        title: 'OEE',
        description:
          'OEE = Overall Equipment Effectiveness<br/>This is the ratio of actual good production to the theoretical output if the machine ran 100% of the scheduled (available) production time at 100% of the rated speed for the current product and 100% yield (no bad parts). <br/><br/>Calculation: sum(Good product) / sum( Available Time * Rated Speed) ) where Available Time = total time - exempt time',
      },
      target: {
        index: 4,
        title: 'TARGET',
        description:
          'Ratio of actual good production to the theoretical output if the machine ran according to established standards. <br/><br/>100% Target means all coil, material, tooling changeovers take the time given by the standard work definition for a safe change & besides changeovers, 100% of the scheduled production time is spent running, the machine runs at 100% of the rated speed for the current product, 100% of the parts produced are good. <br/><br/>Calculation: sum(Good product) / sum( (Available - Standard Changeover time) * Rated Speed) ) where Available Time = total time - exempt time',
      },
      availability: {
        index: 5,
        title: 'AVAILABILITY',
        description:
          'Simple definition: the percentage of scheduled production time the machine is actually running. Note: using time-based percentage only works when the range of products being produced all have the same target production speed.  When calculating an aggregate value across a range of mixed product target speeds, it is necessary to use ratios of production values (length, weight, etc). <br/><br/>Calculation: sum(Running Time * Rated Speed) / sum( Available Time * Rated Speed) ) where Available Time = total time - exempt time',
      },
      speed: {
        index: 6,
        title: 'SPEED',
        description:
          'The ratio of actual running speed to the target production speed for the product.  The target production speed is defined based on the equipment capabilities for the current product and length.  When calculating an aggregate value across a range of mixed product target speeds, it is necessary to use ratios of production values (length, weight, etc). <br/><br/>Calculation:  sum(Good & Bad Quantity * Part Length) / sum( Available Time * Rated Speed) ) where Available Time = total time - exempt time',
      },
      yield: {
        index: 7,
        title: 'YIELD',
        description:
          'The percentage of parts that were good.  <br/>Note: good parts includes parts that were reworked from bad parts or reclaimed from scrap material. \nCalculation: sum(Good product) / sum(Good & Bad Quantity * Part Length)',
      },
      reclaimed: {
        index: 8,
        title: 'RECLAIMED',
        description:
          'The amount of material that was previously reported as scrap that was reclaimed as good. This value is also included in the Total Good column.',
      },
      timebar: {
        index: 9,
        title: 'TIMEBAR',
        description:
          'The downtime summarized into five categories. <br/><br/>(If the numbers do not add up to 100% it means there are delay code definitions that have not been assigned to a category.)',
      },
    };
    onSort = index => { };

    openPrintPreview = ev => {
      this.$mdDialog.show({
        controller: ['$mdDialog', '$timeout', 'data', 'duration', 'startDate', 'endDate', 'shift', 'factoryName', PrintDialogController],
        controllerAs: 'ctrl',
        template: PrintDialogTemp,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          data: this.summaryList,
          duration: this.selectedDuration,
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.shiftMenuTitle,
          factoryName: this.factoryName,
        },
      });
    };
  }],
};

export default ProductionSummaryReport_;
