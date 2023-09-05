import angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ReportService } from '../../../../core/services/report.service';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { AppService } from '../../../../core/services/appService';
import { IApiResolverService } from "../../../../reference";
import { initDate } from '../common';
import { PrintDialogController } from '../components/print-dialog/print-production-dialog';
import PrintDialogTemp from '../components/print-dialog/print-production-dialog.component.html';

import {
  MaterialUsageReportModel,
  DurationType,
  FilterState
} from '../report-type';
import { IMachine } from '../../../../core/dto';

import ReportTemplate from './material-usage-report.html';

const MaterialUsageReport_ = {
  selector: 'materialUsageReport',
  bindings: {},
  template: ReportTemplate,
  /** @ngInject */
  controller: ['$mdPanel', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', '$httpParamSerializer', class MaterialUsageReportComponent {
    _mdPanel;
    summaryList: MaterialUsageReportModel;
    machines: (IMachine & { isChecked: boolean })[] = [];
    endDate: Date = new Date();
    startDate: Date = moment().add(-3, 'months').toDate();
    durations: DurationType[] = ['day', 'week', 'month'];
    selectedDuration: DurationType = this.durations[2];
    machineSub_: Rx.IDisposable;
    reportFilterChanges$ = new Rx.Subject<
      | { startDate: Date }
      | { endDate: Date }
      | { duration: DurationType }
      | { machines: number[] }
    >();
    fileDownloadQueryString: string;

    constructor(
      $mdPanel,
      private $mdDialog,
      clientDataStore: ClientDataStore,
      apiResolver: IApiResolverService,
      appService: AppService,
      private $location: angular.ILocationService,
      public $httpParamSerializer: angular.IHttpParamSerializer
    ) {
      this._mdPanel = $mdPanel;

      const queryString = $location.search();

      //set duration from query string 1st and local storage 2nd
      let qsDuration = queryString.duration;
      let lsDuration = localStorage.getItem('report.materialUsage.Duration');
      this.selectedDuration =
        this.durations.find(f => f === qsDuration) ||
        this.durations.find(f => f === lsDuration) ||
        this.durations[2];

      const result = initDate(
        this.startDate,
        this.endDate,
        this.selectedDuration
      );
      this.startDate = result.startDate;
      this.endDate = result.endDate;

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
        duration: this.selectedDuration,
        machines: qsMachines || this.machines.map(m => m.machineNumber),
      };
      const reportFilterReducer = function (
        state = initialState,
        action:
          | { startDate: Date }
          | { endDate: Date }
          | { duration: DurationType }
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
        .map(filters => {
          const query = {
            ...filters,
            startDate: moment(filters.startDate).format('YYYY-MM-DD'),
            endDate: moment(filters.endDate).format('YYYY-MM-DD'),
          };
          console.log(query);
          return Rx.Observable.fromPromise(
            apiResolver.resolve<MaterialUsageReportModel>(
              'report.materialUsage@get',
              query
            )
          );
        })
        .switch()
        .subscribe(report => {
          console.log('report---', report);
          this.summaryList = report;
          appService.setLoading(false);
        });
    }

    onChangeDate(startDate, endDate) {
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

    onClickDurationItem(item) {
      this.selectedDuration = item;
      const result = initDate(
        this.startDate,
        this.endDate,
        this.selectedDuration
      );
      this.startDate = result.startDate;
      this.endDate = result.endDate;
      localStorage.setItem('report.materialUsage.Duration', item);
      this.reportFilterChanges$.onNext({
        startDate: this.startDate,
        endDate: this.endDate,
        duration: this.selectedDuration,
      });
    }

    updateQueryString(query: FilterState) {
      const exportQuery = {
        ...query,
        startDate: moment(query.startDate).format('YYYY-MM-DD'),
        endDate: moment(query.endDate).format('YYYY-MM-DD'),
      };

      this.$location.search(exportQuery);
      this.fileDownloadQueryString = this.$httpParamSerializer(exportQuery);
    }

    onSort = index => {
      console.log(index);
    };

    openPrintPreview(ev) {
      this.$mdDialog.show({
        /** @ngInject */
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
        },
      });
    }
  }],
};
function DialogController(
  $mdDialog,
  $timeout,
  data,
  duration,
  startDate,
  endDate,
  shift,
  factoryName
) {
  let ctrl = this;
  this.init = function () {
    ctrl.sizes = [
      { id: 0, size: '8.5 x 11' },
      { id: 1, size: '11 x 17' },
    ];
    ctrl.selectedSize = 0;
    ctrl.printStyles = [
      { id: 0, value: "Don't Include" },
      { id: 1, value: 'Side, On Next Page' },
      { id: 2, value: 'Stacked' },
    ];
    ctrl.selectedStyle = 0;
    ctrl.duration = duration;
    ctrl.data = data;
    ctrl.startDate = startDate;
    ctrl.endDate = endDate;
    ctrl.shift = shift;
    ctrl.nextPage = 0;
    ctrl.factoryName = factoryName;
  };
  this.setPageSize = () => {
    let style = document.createElement('style');
    if (!this.selectedSize) {
      style.innerHTML = '@page {size: 8.5in 11in}';
    } else {
      style.innerHTML = '@page {size: 11in 17in}';
    }
    document.head.appendChild(style);
  };

  this.change = () => {
    console.log('changed');
    ctrl.nextPage = 0;
  };

  this.cancel = () => {
    $mdDialog.hide();
  };

  this.print = () => {
    if (ctrl.selectedStyle === 0 && !ctrl.nextPage) {
      ctrl.nextPage = 1;
    } else {
      this.setPageSize();
      let printContents = document.getElementById('main-print-body').innerHTML;
      let mainComp = document.getElementById('print-body');
      mainComp.innerHTML = printContents;
      window.print();
      mainComp.innerHTML = '';
    }
  };

  $timeout(function () {
    ctrl.init();
  });
}

export default MaterialUsageReport_;
