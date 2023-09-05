import angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ReportService } from '../../../../core/services/report.service';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { AppService } from '../../../../core/services/appService';
import { IApiResolverService } from "../../../../reference";

import {
  QualityAudit,
  DurationType,
  FilterState,
  CheckboxMenuItem,
  QualityAuditGroup
} from '../report-type';
import { IMachine } from '../../../../core/dto';

import ReportTemplate from './quality-audit-report.html';
import { PrintDialogController } from '../components/print-dialog/print-production-dialog';
import PrintDialogTemp from '../components/print-dialog/print-production-dialog.component.html';

const QualityAuditReport_ = {
  selector: 'qualityAuditReport',
  bindings: {},
  template: ReportTemplate,
  /** @ngInject */
  controller: ['$mdPanel', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', '$httpParamSerializer', class QualityAuditReportComponent {
    _mdPanel;
    summaryList: QualityAudit[] = [];
    filteredList: QualityAudit[] = [];
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
            apiResolver.resolve<QualityAudit[]>(
              'report.qualityAudit@get',
              query
            )
          );
        })
        .switch()
        .subscribe(report => {
          console.log('summary', report);
          this.summaryList = report;
          this.filteredList = report;
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

    onFilter(searchTxt) {
      if (!searchTxt) {
        this.filteredList = this.summaryList;
      } else {
        searchTxt = searchTxt.toLowerCase();

        this.filteredList = this.summaryList
          .map(item => this.filterItem(searchTxt, item))
          .filter(item => item);
      }
    }

    filterItem(searchTxt: string, item: QualityAudit): QualityAudit {
      let filteredGroups = item.groups.map(g => this.filterGroup(searchTxt, g));
      if (filteredGroups.length) {
        return { ...item, groups: filteredGroups.filter(g => g) };
      }
      return null;
    }

    filterGroup(searchTxt, group: QualityAuditGroup): QualityAuditGroup {
      // if the group key gets a search hit, return the entire group
      if (
        this.onGetFilterIndex(group.key.orderCode, searchTxt) ||
        this.onGetFilterIndex(group.key.materialCode, searchTxt) ||
        this.onGetFilterIndex(group.key.toolingCode, searchTxt) ||
        this.onGetFilterIndex(group.key.customerName, searchTxt)
      ) {
        return group;
      }

      // no hit on the key, filter the entries
      let filteredEntries = group.entries.filter(e => {
        return (
          this.onGetFilterIndex(e.employeeName, searchTxt) ||
          this.onGetFilterIndex(e.employeeNumber, searchTxt) ||
          this.onGetFilterIndex(e.coilSerialNumber, searchTxt) ||
          this.onGetFilterIndex(e.listText, searchTxt) ||
          this.onGetFilterIndex(e.listValue, searchTxt) ||
          this.onGetFilterIndex(e.listId.toString(), searchTxt)
        );
      });

      if (filteredEntries.length) {
        return { ...group, entries: filteredEntries };
      }

      return null;
    }
  }],
};

export default QualityAuditReport_;
