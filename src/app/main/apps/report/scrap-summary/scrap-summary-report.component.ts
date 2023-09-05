import * as moment from 'moment';
import * as _ from 'lodash';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { AppService } from '../../../../core/services/appService';
import { IApiResolverService } from "../../../../reference";

import {
  CoilSummary,
  FilterState
} from '../report-type';
import { IMachine } from '../../../../core/dto';

import ReportTemplate from './scrap-summary-report.html';

const ScrapSummaryReport_ = {
  selector: 'scrapSummaryReport',
  bindings: {},
  template: ReportTemplate,
  /** @ngInject */
  controller: ['$mdPanel', '$filter', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', '$httpParamSerializer', class ScrapSummaryReportComponent {
    _mdPanel;
    summaryList: CoilSummary[] = [];
    filteredList: CoilSummary[] = [];
    machines: (IMachine & { isChecked: boolean })[] = [];
    endDate: Date = new Date();
    startDate: Date = moment().add(-1, 'months').toDate();
    machineSub_: Rx.IDisposable;
    reportFilterChanges$ = new Rx.Subject<
      | { startDate: Date }
      | { endDate: Date }
      | { group1: string }
      | { group2: string }
      | { machines: number[] }
    >();

    groupByList = [
      { name: 'All', selector: 'All' },
      { name: 'Machine', selector: 'Machine' },
      { name: 'Shift', selector: 'Shift' },
      { name: 'Operator', selector: 'Operator' },
      { name: 'Machine Group', selector: 'MachineGroup' },
      { name: 'Date', selector: 'Date' },
      { name: 'Material', selector: 'Material' },
      { name: 'Gauge', selector: 'Gauge' },
      { name: 'Gauge & Width', selector: 'GaugeWidth' },
      { name: 'Gauge, Width & Tooling', selector: 'GaugeWidthTooling' },
      { name: 'Tooling Code', selector: 'Tooling' },
    ];
    thenByList = [
      { name: 'All', selector: 'All' },
      { name: 'Shift', selector: 'Shift' },
      { name: 'Machine', selector: 'Machine' },
      { name: 'Shift & Machine', selector: 'ShiftMachine' },
    ];
    selectedGroup = this.groupByList[0];
    selectedThen = this.thenByList[0];
    _filter;
    fileDownloadQueryString: string;

    constructor(
      $mdPanel,
      $filter: angular.IFilterService,
      private $mdDialog,
      clientDataStore: ClientDataStore,
      apiResolver: IApiResolverService,
      appService: AppService,
      private $location: angular.ILocationService,
      public $httpParamSerializer: angular.IHttpParamSerializer
    ) {
      this._mdPanel = $mdPanel;
      this._filter = $filter;

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
      if (queryString.group1) {
        let g1 = this.groupByList.find(g => g.selector === queryString.group1);
        if (g1) this.selectedGroup = g1;
      }
      if (queryString.group2) {
        let g2 = this.thenByList.find(g => g.selector === queryString.group2);
        if (g2) this.selectedThen = g2;
      }

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
        group1: this.selectedGroup.selector,
        group2: this.selectedThen.selector,
        machines: qsMachines || this.machines.map(m => m.machineNumber),
      };
      const reportFilterReducer = function (
        state = initialState,
        action:
          | { startDate: Date }
          | { endDate: Date }
          | { group1: string }
          | { group2: string }
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
            apiResolver.resolve<any[]>('report.scrapSummary@get', query)
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

    onGetGroupHeader(keyg, keyt) {
      let result = '';
      if (keyg === 'All') {
        result = `<div class="group-key">All</div>`;
      } else if (keyg['machineNumber']) {
        result = `<div class="group-key">Machine:</div><div class="group-key-val">${keyg['machineNumber']}</div>`;
      } else if (keyg['machineGroup']) {
        result = `<div class="group-key">Machine Group:</div><div class="group-key-val">${keyg['machineGroup']}</div>`;
      } else if (keyg['shift']) {
        result = `<div class="group-key">Shift:</div><div class="group-key-val">${keyg['shift']}</div>`;
      } else if (keyg['operator']) {
        result = `<div class="group-key">Operator:</div>
                    <div class="group-key-val">${keyg['operator']['employeeNumber']}</div>
                    <div class="group-key-val">${keyg['operator']['employeeName']}</div>
                    `;
      } else if (keyg['date']) {
        result = `<div class="group-key">Date:</div><div class="group-key-val">${this._filter(
          'date'
        )(keyg['date'], 'mediumDate')}</div>`;
      } else if (keyg['materialCode']) {
        result = `<div class="group-key">Material:</div><div class="group-key-val">${keyg['materialCode']}</div>`;
      } else if (keyg['gauge'] && keyg['widthIn'] && keyg['toolingCode']) {
        result = `<div class="group-key">Gauge/Width/Tooling:</div>
                    <div class="group-key-val">${keyg['gauge']}</div>
                    <div class="group-key-val">${keyg['widthIn']}</div>
                    <div class="group-key-val">${keyg['toolingCode']}</div>
                    `;
      } else if (keyg['gauge'] && keyg['widthIn']) {
        result = `<div class="group-key">Gauge/Width:</div>
                    <div class="group-key-val">${keyg['gauge']}</div>
                    <div class="group-key-val">${keyg['widthIn']}</div>
                    `;
      } else if (keyg['gauge']) {
        result = `<div class="group-key">Gauge:</div><div class="group-key-val">${keyg['gauge']}</div>`;
      } else if (keyg['toolingCode']) {
        result = `<div class="group-key">Tooling Code:</div><div class="group-key-val">${keyg['toolingCode']}</div>`;
      }

      if (keyt === 'All') {
        result += `<div class="group-key">All</div>`;
      }
      if (keyt['machineNumber']) {
        result += `<div class="group-key">Machine:</div><div class="group-key-val">${keyt['machineNumber']}</div>`;
      }
      if (keyt['shift']) {
        result += `<div class="group-key">Shift:</div><div class="group-key-val">${keyt['shift']}</div>`;
      }
      return result;
    }

    onChangeGroup(item) {
      this.selectedGroup = item;
      this.reportFilterChanges$.onNext({
        group1: this.selectedGroup.selector,
      });
      this.updateThenBy(item.selector);
    }

    onChangeThen(item) {
      this.selectedThen = item;
      this.reportFilterChanges$.onNext({
        group2: this.selectedThen.selector,
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

    onClose(selectedItem) {
      selectedItem.isOpen = !selectedItem.isOpen;
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
      this.fileDownloadQueryString = this.$httpParamSerializer(exportQuery);
    }

    onGetFilterIndex(mainTxt, searchTxt) {
      const realTxt = mainTxt.toLowerCase();
      return realTxt.indexOf(searchTxt) > -1;
    }

    updateThenBy(group1: string) {
      let currentThenBy = this.selectedThen.selector;
      switch (group1) {
        case 'All':
          this.thenByList = [{ name: 'All', selector: 'All' }];
          break;
        case 'Shift':
          this.thenByList = [
            { name: 'All', selector: 'All' },
            { name: 'Machine', selector: 'Machine' },
          ];
          break;
        case 'Machine':
          this.thenByList = [
            { name: 'All', selector: 'All' },
            { name: 'Shift', selector: 'Shift' },
          ];
          break;
        default:
          this.thenByList = [
            { name: 'All', selector: 'All' },
            { name: 'Shift', selector: 'Shift' },
            { name: 'Machine', selector: 'Machine' },
            { name: 'Shift & Machine', selector: 'ShiftMachine' },
          ];
      }

      let foundThenBy = this.thenByList.find(x => x.selector === currentThenBy);
      if (!foundThenBy) {
        this.selectedThen = this.thenByList[0];
        this.onChangeThen(this.selectedThen);
      }
    }

    onFilter(searchTxt) {
      // if (!searchTxt) {
      //   this.filteredList = this.summaryList;
      // } else {
      //   const realSearchTxt = searchTxt.toLowerCase();
      //   this.filteredList = this.summaryList.filter(item => {
      //     if (this.onGetFilterIndex(item.coil.coilId, realSearchTxt)) {
      //       return true;
      //     } else if (
      //       this.onGetFilterIndex(item.coil.materialCode, realSearchTxt)
      //     ) {
      //       return true;
      //     } else if (
      //       this.onGetFilterIndex(item.coil.heatNumber, realSearchTxt)
      //     ) {
      //       return true;
      //     } else if (
      //       this.onGetFilterIndex(item.coil.description, realSearchTxt)
      //     ) {
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   });
      // }
    }
  }],
};

export default ScrapSummaryReport_;
