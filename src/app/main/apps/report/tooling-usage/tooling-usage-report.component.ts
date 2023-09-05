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
  ToolingUsageReportModel,
  DurationType,
  FilterState
} from '../report-type';
import { IMachine } from '../../../../core/dto';

import ReportTemplate from './tooling-usage-report.html';

const ToolingUsageReport_ = {
  selector: 'toolingUsageReport',
  bindings: {},
  template: ReportTemplate,
  /** @ngInject */
  controller: ['$mdPanel', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', '$httpParamSerializer', class ToolingUsageReportComponent {
    _mdPanel;
    summaryList: ToolingUsageReportModel;
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
      let lsDuration = localStorage.getItem('report.toolingUsage.Duration');
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
            apiResolver.resolve<ToolingUsageReportModel>(
              'report.toolingUsage@get',
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
      localStorage.setItem('report.toolingUsage.Duration', item);
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

export default ToolingUsageReport_;
