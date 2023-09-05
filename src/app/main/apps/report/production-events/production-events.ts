import * as _ from 'lodash';
import * as moment from 'moment';
import { IMachine } from '../../../../core/dto';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { AppService } from '../../../../core/services/appService';
import { FilterState, CheckboxMenuItem } from '../report-type';

const ProductionEventsReport = {
  selector: 'productionEventsReport',
  template: `
    <div
      id="dashboard-report"
      class="page-layout simple fullwidth white-bg production-summary"
    >
      <report-header
        subject="Production Events"
        on-filter="$ctrl.onFilter(searchTxt)"
      ></report-header>

      <div class="summary-title-header">
        <checkbox-menu
          class="menu-column"
          subject="Shift"
          menu-subject="Shift"
          menu-list="$ctrl.shiftMenu"
          on-change="$ctrl.onChangeShift(items)"
        ></checkbox-menu>

        <report-date-col
          class="date-column"
          start-date="$ctrl.startDate"
          end-date="$ctrl.endDate"
          duration="'day'"
          on-change="$ctrl.onChangeDate(startDate, endDate)"
        ></report-date-col>

        <checkbox-menu
          class="menu-column float-right"
          subject="MACHINES"
          menu-subject="SHOW MACHINES"
          menu-list="$ctrl.machines"
          on-change="$ctrl.onChangeMachines(items)"
        ></checkbox-menu>
      </div>

      <div
        class="content md-background md-hue-1 summary-main-content"
        ms-scroll
      >
        <div class="material-usage-content">
          <production-log machines="$ctrl.machineNums" start-date="$ctrl.startDate" end-date="$ctrl.endDate" shifts="$ctrl.shifts"></production-log>
        </div>
      </div>
    </div>
  `,
  bindings: {},
  controller: ['clientDataStore', '$location', 'appService', class ProductionEventsReportComponent {
    machines: (IMachine & { isChecked: boolean })[] = [];
    shiftMenu: CheckboxMenuItem[] = [
      { name: 1, isChecked: true },
      { name: 2, isChecked: true },
      { name: 3, isChecked: true },
    ];
    machineNums: number[] = [];
    startDate: Date = moment().add(-1, 'weeks').toDate();;
    endDate: Date = new Date();
    shifts: number[];
    reportFilterChanges$ = new Rx.Subject<
      | { startDate: Date }
      | { endDate: Date }
      | { machines: number[] }
      | { shifts: number[] }
    >();
    machineSub_: Rx.IDisposable;

    /** @ngInject */
    constructor(
      clientDataStore: ClientDataStore,
      private $location: angular.ILocationService,
      appService: AppService
   ) {
      const queryString = $location.search();
      if (queryString.startDate) {
         const m = moment(queryString.startDate);
         if (m.isValid()) this.startDate = m.toDate();
      }
      if (queryString.endDate) {
         const m = moment(queryString.endDate);
         if (m.isValid()) this.endDate = m.toDate();
      }
      const qsMachines: number[] = queryString.machines
         ? queryString.machines.map(m => Number(m))
         : undefined;
      const qsShifts: number[] = queryString.shifts
         ? queryString.shifts.map(m => Number(m))
         : undefined;

      this.machineSub_ = clientDataStore
        .SelectMachines()
        .filter(ms => ms && ms.length > 0)
        .map(ms => _.sortBy(ms, m => m.description))
        .subscribe(machines => {
          this.machines = machines.map(m => ({
            ...m,
            isChecked: !qsMachines || qsMachines.includes(m.machineNumber),
          }));
        });

      const initialState: FilterState = {
         startDate: this.startDate,
         endDate: this.endDate,
         shifts: qsShifts || this.shiftMenu.map(m => m.name),
         machines: qsMachines || this.machines.map(m => m.machineNumber),
       };
       const reportFilterReducer = function (
         state = initialState,
         action:
           | { startDate: Date }
           | { endDate: Date }
           | { shifts: number[] }
           | { machines: number[] }
       ) {
         return { ...state, ...action };
       };

       const reportFilterSubject$ = new Rx.BehaviorSubject(initialState);
       this.reportFilterChanges$
         .scan(reportFilterReducer, initialState)
         .subscribe(state => reportFilterSubject$.onNext(state));

       const sub_ = reportFilterSubject$
         .filter(filter => filter.machines.length > 0)
         .do(() => appService.setLoading(true))
         .do(query => this.updateQueryString(query))
         .subscribe(report => {
            this.machineNums = this.machines
            .filter(m => m.isChecked)
            .map(m => m.machineNumber);
           appService.setLoading(false);
         });

      // Initialize the grid's filter data.
      // const dates = initDate(new Date(), new Date(), 'week');
      // this.startDate = dates.startDate;
      // this.endDate = dates.endDate;
      // this.shifts = this.shiftMenu.map(m => m.name);
    }
    onFilter(searchTxt: string) {
      console.log(searchTxt);
    }
    onChangeShift(items: CheckboxMenuItem[]) {
      console.log(items);
      this.reportFilterChanges$.onNext({
         shifts: this.shiftMenu.filter(x => x.isChecked).map(x => x.name),
       });
      this.shifts = items.filter(i => i.isChecked).map(i => i.name);
    }
    onChangeDate(startDate: Date, endDate: Date) {
      console.log('111111')
      this.startDate = startDate;
      this.endDate = endDate;
      this.reportFilterChanges$.onNext({
         startDate: this.startDate,
         endDate: this.endDate,
       });
    }
    onChangeMachines(items) {
      this.machines = items;
      this.reportFilterChanges$.onNext({
        machines: this.machines
          .filter(x => x.isChecked)
          .map(m => m.machineNumber),
      });
    }
    updateQueryString(query: FilterState) {
      const exportQuery = {
        ...query,
        startDate: moment(query.startDate).format('YYYY-MM-DD'),
        endDate: moment(query.endDate).format('YYYY-MM-DD'),
      };

      this.$location.search(exportQuery);
    }
  }],
};

export default ProductionEventsReport;
