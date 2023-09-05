import angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IApiResolverService } from "../../../../reference";
import { AppService } from '../../../../core/services/appService';
import { initDate } from '../common';
import { FilterState, MaterialUsageReportModel, DurationType } from '../report-type';

import Temp from './material-demand-report.html';
import { PrintDialogController } from '../components/print-dialog/print-production-dialog';
import PrintDialogTemp from '../components/print-dialog/print-production-dialog.component.html';

const MaterialDemandReport_ = {
  selector: 'materialDemandReport',
  bindings: {},
  template: Temp,
  /** @ngInject */
  controller: ['$mdPanel', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', '$httpParamSerializer', class MaterialDemandReportComponent {
    _mdPanel;
    summaryList: MaterialUsageReportModel;
    endDate: Date = new Date();
    startDate: Date = moment().add(-3, 'months').toDate();
    durations: DurationType[] = ['day', 'week', 'month'];
    scheduleStatusList = ['All', 'Scheduled', 'Unscheduled'];
    selectedDuration: DurationType = this.durations[2];
    selectedScheduleStatus: string = this.scheduleStatusList[0];
    reportFilterChanges$ = new Rx.Subject<
      | { startDate: Date }
      | { endDate: Date }
      | { duration: DurationType }
      | { scheduleStatus: string }
    >();
    fileDownloadQueryString: string;
    sortKey = '';
    sortDir = '';
    sortedSummaryList: MaterialUsageReportModel;

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
      let lsDuration = localStorage.getItem('report.materialDemand.Duration');
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

      const initialState: FilterState = {
        startDate: this.startDate,
        endDate: this.endDate,
        duration: this.selectedDuration,
        scheduleStatus: this.selectedScheduleStatus,
      };
      const reportFilterReducer = function (
        state = initialState,
        action:
          | { startDate: Date }
          | { endDate: Date }
          | { duration: DurationType }
          | { scheduleStatus: string }
      ) {
        return { ...state, ...action };
      };

      const reportFilterSubject$ = new Rx.BehaviorSubject(initialState);
      this.reportFilterChanges$
        .scan(reportFilterReducer, initialState)
        .subscribe(state => reportFilterSubject$.onNext(state));

      const sub_ = reportFilterSubject$
        .do(() => appService.setLoading(true))
        .do(query => this.updateQueryString(query))
        .map(filters => {
          const query = {
            ...filters,
            startDate: moment(filters.startDate).format('YYYY-MM-DD'),
            endDate: moment(filters.endDate).format('YYYY-MM-DD'),
          };

          return Rx.Observable.fromPromise(
            apiResolver.resolve<MaterialUsageReportModel>(
              'report.materialDemand@get',
              query
            )
          );
        })
        .switch()
        .subscribe(report => {
          console.log('report---', report);
          this.summaryList = report;
          this.sortedSummaryList = report;
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

    onChangeStatus(item) {
      this.selectedScheduleStatus = item;
      this.reportFilterChanges$.onNext({
        scheduleStatus: item,
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
      localStorage.setItem('report.materialDemand.Duration', item);
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

    onSortBy(val) {
      if (val === this.sortKey) {
        if (this.sortDir === '') {
          this.sortDir = 'asc';
        } else if (this.sortDir === 'asc') {
          this.sortDir = 'desc';
        } else if (this.sortDir === 'desc') {
          this.sortDir = '';
        }
      } else {
        this.sortDir = 'asc';
        this.sortKey = val;
      }

      if (this.sortDir === '') {
        this.sortedSummaryList = this.summaryList;
      } else {
        const groups = _.orderBy(this.summaryList.groups, this.sortKey, this.sortDir);
        this.sortedSummaryList = { ...this.sortedSummaryList, groups };
      }

    }

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

export default MaterialDemandReport_;
