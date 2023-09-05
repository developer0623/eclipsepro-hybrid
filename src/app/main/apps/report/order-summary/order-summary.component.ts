import angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ReportService } from '../../../../core/services/report.service';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { AppService } from '../../../../core/services/appService';
import { IApiResolverService } from "../../../../reference";

import {
  OrderSummary,
  DurationType,
  FilterState,
  CheckboxMenuItem
} from '../report-type';
import { IMachine } from '../../../../core/dto';

import ReportTemplate from './order-summary-report.html';
import { PrintDialogController } from '../components/print-dialog/print-production-dialog';
import PrintDialogTemp from '../components/print-dialog/print-production-dialog.component.html';

const OrderSummaryReport_ = {
  selector: 'orderSummaryReport',
  bindings: {},
  template: ReportTemplate,
  /** @ngInject */
  controller: ['$mdPanel', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', '$httpParamSerializer', class OrderSummaryReportComponent {
    _mdPanel;
    summaryList: OrderSummary[] = [];
    filteredList: OrderSummary[] = [];
    machines: (IMachine & { isChecked: boolean })[] = [];
    endDate: Date = new Date();
    startDate: Date = moment().add(-10, 'days').toDate();
    machineSub_: Rx.IDisposable;
    fileDownloadQueryString: string;

    shiftMenu: CheckboxMenuItem[] = [
      { name: 1, isChecked: true },
      { name: 2, isChecked: true },
      { name: 3, isChecked: true },
    ];

    reportFilterChanges$ = new Rx.Subject<
      | { startDate: Date }
      | { endDate: Date }
      | { duration: DurationType }
      | { machines: number[] }
      | { shifts: number[] }
    >();

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
        duration: 'day',
        machines: qsMachines || this.machines.map(m => m.machineNumber),
      };
      const reportFilterReducer = function (
        state = initialState,
        action: { startDate: Date } | { endDate: Date } | { machines: number[] }
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
            apiResolver.resolve<OrderSummary[]>(
              'report.orderSummary@get',
              query
            )
          );
        })
        .switch()
        .subscribe(report => {
          this.summaryList = report;
          this.filteredList = report;
          console.log('this.filteredList', report);
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

    onChangeShift(items: CheckboxMenuItem[]) {
      this.shiftMenu = items;
      this.reportFilterChanges$.onNext({
        shifts: this.shiftMenu.filter(x => x.isChecked).map(m => m.name),
      });
    }

    onClose(selectedItem) {
      selectedItem.isOpen = !selectedItem.isOpen;
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

    //todo: localize the help
    onSort = index => {
      console.log(index);
    };

    openPrintPreview(ev) {
      this.$mdDialog.show({
        controller: ['$mdDialog', '$timeout', 'data', 'duration', 'startDate', 'endDate', 'shift', 'factoryName', PrintDialogController],
        controllerAs: 'ctrl',
        template: PrintDialogTemp,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          data: this.summaryList,
          startDate: this.startDate,
          endDate: this.endDate,
        },
      });
    }

    onGetFilterIndex(mainTxt, searchTxt) {
      const realTxt = mainTxt.toLowerCase();
      return realTxt.indexOf(searchTxt) > -1;
    }

    loadMore() {
      console.log('test');
    }

    onFilter(searchTxt: string) {
      if (!searchTxt) {
        this.filteredList = this.summaryList;
      } else {
        const realSearchTxt = searchTxt.toLowerCase();
        this.filteredList = this.summaryList.filter(item => {
          if (this.onGetFilterIndex(item.orderCode, realSearchTxt)) {
            return true;
          }
          if (this.onGetFilterIndex(item.materialCode, realSearchTxt)) {
            return true;
          }
          if (this.onGetFilterIndex(item.toolingCode, realSearchTxt)) {
            return true;
          }
          if (item.bundles.some(o => this.bundleFilter(o, realSearchTxt))) {
            return true;
          }
          return false;
        });
      }
    }

    bundleFilter(bundle, searchTxt) {
      if (this.onGetFilterIndex(bundle.bundleIdentity, searchTxt)) {
        return true;
      }
      if (
        bundle.prodRuns.some(r =>
          this.onGetFilterIndex(r.coilSerialNumber, searchTxt)
        )
      ) {
        return true;
      }
      return false;
    }
  }],
};

export default OrderSummaryReport_;
