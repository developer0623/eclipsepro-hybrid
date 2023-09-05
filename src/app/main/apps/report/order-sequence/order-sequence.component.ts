import angular from 'angular';
import * as _ from 'lodash';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { AppService } from '../../../../core/services/appService';
import { IApiResolverService } from "../../../../reference";

import {
  OrderSequence
} from '../report-type';
import { IMachine } from '../../../../core/dto';

import ReportTemplate from './order-sequence-report.html';
import { PrintDialogController } from '../components/print-dialog/print-production-dialog';
import PrintDialogTemp from '../components/print-dialog/print-production-dialog.component.html';

interface IQuery {
  machines?: number[],
  type?: string,
}

const OrderSequenceReport_ = {
  selector: 'orderSequenceReport',
  bindings: {},
  template: ReportTemplate,
  /** @ngInject */
  controller: ['$mdPanel', '$mdDialog', 'clientDataStore', 'apiResolver', 'appService', '$location', '$httpParamSerializer', '$scope', '$stateParams', '$state', class OrderSequenceReportComponent {
    _mdPanel;
    summaryList: OrderSequence[] = [];
    filteredList: OrderSequence[] = [];
    machines: (IMachine & { isChecked: boolean })[] = [];
    machineSub_: Rx.IDisposable;
    fileDownloadQueryString: string;

    reportFilterChanges$ = new Rx.Subject<
      | { machines: number[] }
    >();

    selectedDisplayType = 'Simple';
    displayTypes = ['Simple', 'Items', 'Bundles'];
    machineNumbers: number[] = [];
    groupVals = {};

    masterHeaderColumns: ColumnChoice[] = [
      {
        field: 'status',
        title: "status",
        isChecked: false,
      },
      {
        field: 'customerName',
        title: "customer",
        isChecked: false,
      },
      {
        field: 'requiredDate',
        title: "requiredBy",
        isChecked: false,
        filter: 'amsDate'
      },
      {
        field: 'completionDate',
        title: "complete",
        isChecked: false,
        filter: 'amsDateTime'
      },
      {
        field: 'importDate',
        title: 'imported',
        isChecked: false,
        filter: 'amsDate'
      },
      {
        field: 'salesOrder',
        title: "salesOrder",
        isChecked: false,
      },
      {
        field: 'workOrder',
        title: "workOrder",
        isChecked: false,
      },
      {
        field: 'customerPO',
        title: "purchaseOrder",
        isChecked: false,
      },
      {
        field: 'customerNumber',
        title: "customerNumber",
        isChecked: false,
      },
      {
        field: 'truckNumber',
        title: "truckNumber",
        isChecked: false,
      },
      {
        field: 'stagingBay',
        title: "stagingBay",
        isChecked: false,
      },
      {
        field: 'loadingDock',
        title: "loadingDock",
        isChecked: false,
      },
      {
        field: 'user1',
        title: "orderUser1",
        isChecked: false,
      },
      {
        field: 'user2',
        title: "orderUser2",
        isChecked: false,
      },
      {
        field: 'user3',
        title: "orderUser3",
        isChecked: false,
      },
      {
        field: 'user4',
        title: "orderUser4",
        isChecked: false,
      },
      {
        field: 'user5',
        title: "orderUser5",
        isChecked: false,
      },
      {
        field: 'longestLengthIn',
        title: "longestPart",
        isChecked: false,
        filter: 'unitsFormat:"in":3'
      },
      {
        field: 'shortestLengthIn',
        title: "shortestPart",
        isChecked: false,
        filter: 'unitsFormat:"in":3'
      },
      {
        field: 'bundleCount',
        title: "bundleCount",
        isChecked: false,
      },
      {
        field: 'materialColor',
        title: "Color",
        isChecked: false,
      },
      {
        field: 'materialGauge',
        title: "Width",
        isChecked: false,
      },
      {
        field: 'operatorMessage',
        title: "Message",
        isChecked: false,
      },
    ];

    masterItemColumns: ColumnChoice[] = [
        {
          field: 'quantityDone',
          title: 'quantityDone',
          isChecked: false,
        },
        {
          field: 'patternName',
          title: 'patternName',
          isChecked: false,
        },
        {
          field: 'option',
          title: 'option',
          isChecked: false,
        },
        {
          field: 'externalItemId',
          title: 'itemId',
          isChecked: false,
        },
        {
          field: 'bundleGroup',
          title: 'bundleGroup',
          isChecked: false,
        },
        {
          field: 'user1',
          title: 'itemUser1',
          isChecked: false,
        },
        {
          field: 'user2',
          title: 'itemUser2',
          isChecked: false,
        },
        {
          field: 'user3',
          title: 'itemUser3',
          isChecked: false,
        },
        {
          field: 'user4',
          title: 'itemUser4',
          isChecked: false,
        },
        {
          field: 'user5',
          title: 'itemUser5',
          isChecked: false,
        },
        {
          field: 'messageText',
          title: 'message',
          isChecked: false,
        },
        {
          field: 'pieceMark',
          title: 'pieceMark',
          isChecked: false,
        },
    ];

    masterBundleColumns: ColumnChoice[] = [
        {
          field: 'user1',
          title: 'bundleUser1',
          isChecked: false,
        },
        {
          field: 'user2',
          title: 'bundleUser2',
          isChecked: false,
        },
        {
          field: 'user3',
          title: 'bundleUser3',
          isChecked: false,
        },
        {
          field: 'user4',
          title: 'bundleUser4',
          isChecked: false,
        },
        {
          field: 'user5',
          title: 'bundleUser5',
          isChecked: false,
        },
    ];

    headerColumns = [];
    itemColumns = [];
    bundleColumns = [];
    selectedHeaderColumns = [];
    selectedItemColumns = [];
    selectedBundleColumns = [];

    constructor(
      $mdPanel,
      private $mdDialog,
      clientDataStore: ClientDataStore,
      private apiResolver: IApiResolverService,
      appService: AppService,
      private $location: angular.ILocationService,
      public $httpParamSerializer: angular.IHttpParamSerializer,
      $scope,
      private $stateParams,
      private $state
    ) {
      console.log('$stateParams.', $stateParams.machines);
      this._mdPanel = $mdPanel;

      this.headerColumns = this.getMergedColumns('headerColumns', this.masterHeaderColumns);
      this.selectedHeaderColumns = this.headerColumns.filter(x=>x.isChecked);

      this.itemColumns = this.getMergedColumns('itemColumns', this.masterItemColumns);
      this.selectedItemColumns = this.itemColumns.filter(x=>x.isChecked);

      this.bundleColumns = this.getMergedColumns('bundleColumns', this.masterBundleColumns);
      this.selectedBundleColumns = this.bundleColumns.filter(x=>x.isChecked);

      const queryString = $location.search();

      this.machineNumbers = this.onGetQuery(queryString);
      this.selectedDisplayType = queryString.type ? queryString.type : this.displayTypes[0];

      this.machineSub_ = clientDataStore
        .SelectMachines()
        .filter(ms => ms && ms.length > 0)
        .map(ms => _.sortBy(ms, m => m.description))
        .subscribe(machines => {
          this.machines = machines.map(m => ({
            ...m,
            isChecked: !this.machineNumbers || this.machineNumbers.includes(m.machineNumber),
          }));
          if(!this.machineNumbers) {
            const machineNumbers = this.machines.map(m => m.machineNumber);
            this.reportFilterChanges$.onNext({
              machines: machineNumbers
            });
          }
        });

      const initialState = {
        machines: this.machineNumbers || this.machines.map(m => m.machineNumber),
      };
      const reportFilterReducer = function (
        state = initialState,
        action: { machines: number[] }
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
        .do(query => this.updateQueryString(query as IQuery))
        .map(filters => {
          const query = {
            ...filters,
          };
          console.log(query);
          return Rx.Observable.fromPromise(
            apiResolver.resolve<OrderSequence[]>(
              'report.machineSchedule@get',
              query
            )
          );
        })
        .switch()
        .map(orders => {return orders.map(order => {
          let bundles = _(order.items)
          .groupBy(i => i.bundle)
          .map((bundle_items, bundle) => {
            const _bundle_items = _(bundle_items);
            const bundleNo = Number(bundle);
            return {
              bundleNo: bundleNo,
              totalLbs: _bundle_items.map(x => x.weightLbs).sum(),
              pieces: _bundle_items.map(x => x.quantity).sum(),
              totalFt: _bundle_items.map(x => x.lengthIn * x.quantity).sum() / 12,
      
              bundleMinLengthIn: _bundle_items
                .map(x => x.lengthIn)
                .filter(x => x > 0) // zero is used on message only lines and is not produced.
                .min(),
              bundleMaxLengthIn: _bundle_items.map(x => x.lengthIn).max(),

              user1: order.bundles.find(b => b.bundle === bundleNo)?.user1,
              user2: order.bundles.find(b => b.bundle === bundleNo)?.user2,
              user3: order.bundles.find(b => b.bundle === bundleNo)?.user3,
              user4: order.bundles.find(b => b.bundle === bundleNo)?.user4,
              user5: order.bundles.find(b => b.bundle === bundleNo)?.user5,              
            };
          }).value();
          return {...order, bundles: bundles}
        })})
        .do((d) => console.log('d', d))
        .subscribe(report => {
          this.summaryList = report;
          this.filteredList = report;
          console.log('filteredList', this.filteredList)

          this.groupVals = {};
          this.filteredList.forEach(item => {
            const machineNumber = item.job.machineNumber;
            const itemVals = this.groupVals[machineNumber];
            if(itemVals) {
              const newVals = {
                weight: itemVals.weight + item.job.remainingLbs,
                length: itemVals.length + item.job.remainingFt
              };
              this.groupVals = {
                ...this.groupVals,
                [machineNumber]: newVals
              }
            } else {
              this.groupVals = {
                ...this.groupVals,
                [machineNumber]: {
                  weight: item.job.remainingLbs,
                  length: item.job.remainingFt
                }
              }
            }
          });

          // summarize by material - move to server or above foreach?
          let mach = 0;
          let material = '';
          let currentFt = 0;
          let currentLbs = 0;
          let currentCount = 0;
          for (let i = 0; i < this.filteredList.length; i++) {
            const item = this.filteredList[i];
            if (item.job.machineNumber !== mach || item.job.materialCode !== material) {
              mach = item.job.machineNumber;
              material = item.job.materialCode;
              currentFt = 0;
              currentLbs = 0;
              currentCount = 0;
              if (i > 0) {
                // update the last item
                this.filteredList[i - 1].materialGroup.accLast = true;
              }
            }
            currentFt += item.job.remainingFt;
            currentLbs += item.job.remainingLbs;
            currentCount++;
            item.materialGroup = {
              accFt: currentFt,
              accLbs: currentLbs,
              accCount: currentCount,
              accLast: false
            };
          }
          if (this.filteredList.length > 0) {
            // update the last item
            this.filteredList[this.filteredList.length - 1].materialGroup.accLast = true;
          }

          appService.setLoading(false);
        });

        $scope.$on("$destroy", () => {
          // this.machineSub_.dispose();
          // sub_.dispose();
       });
    }

    onGetQuery(queryString) {
      const {machines} = queryString;
      if(!machines) {
        return undefined;
      }

      if(Array.isArray(machines)) {
        return machines.map(m => Number(m))
      }

      return [Number(machines)];
    }

    onChangeMachines(items) {
      this.machines = items;
      this.machineNumbers = this.machines
        .filter(x => x.isChecked)
        .map(m => m.machineNumber);
      this.reportFilterChanges$.onNext({
        machines: this.machineNumbers
      });
    }

    onClickTypes(item: string) {
      this.selectedDisplayType = item;
      this.updateQueryString({type: this.selectedDisplayType});
    }

    onClose(selectedItem) {
      selectedItem.isOpen = !selectedItem.isOpen;
    }

    updateQueryString(query: IQuery) {
      const currentQuery = this.$location.search();
      const exportQuery = {
        ...currentQuery,
        ...query
      };

      this.$location.search(exportQuery);
      this.fileDownloadQueryString = this.$httpParamSerializer(exportQuery);
    }

    //todo: localize the help
    onSort = index => {
      console.log(index);
    };

    openPrintPreview = ev => {
      window.print();
    };

    onGetFilterIndex(mainTxt, searchTxt) {
      const realTxt = mainTxt.toLowerCase();
      return realTxt.indexOf(searchTxt) > -1;
    }

    onFilter(searchTxt: string) {
      if (!searchTxt) {
        this.filteredList = this.summaryList;
      } else {
        const realSearchTxt = searchTxt.toLowerCase();
        this.filteredList = this.summaryList.filter(item => {
          if (this.onGetFilterIndex(item.id, realSearchTxt)) {
            return true;
          }
          // if (this.onGetFilterIndex(item.materialCode, realSearchTxt)) {
          //   return true;
          // }
          // if (this.onGetFilterIndex(item.toolingCode, realSearchTxt)) {
          //   return true;
          // }
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

    onHeaderColumnToggle = column => {
      column.isChecked = !column.isChecked;
      this.selectedHeaderColumns = this.headerColumns.filter(x=>x.isChecked);
      this.setColumnData('headerColumns', this.headerColumns);
    };

    onItemColumnToggle = column => {
      column.isChecked = !column.isChecked;
      this.selectedItemColumns = this.itemColumns.filter(x=>x.isChecked);
      this.setColumnData('itemColumns', this.itemColumns);
    };

    onBundleColumnToggle = column => {
      column.isChecked = !column.isChecked;
      this.selectedBundleColumns = this.bundleColumns.filter(x=>x.isChecked);
      this.setColumnData('bundleColumns', this.bundleColumns);
    };

    getMergedColumns(type: string, masterColumns: ColumnChoice[]): ColumnChoice[] {
      // todo: consider getting this data from the server and not local storage
      const localStorageColumns = localStorage.getItem('report.orders-sequence.'+ type);
      const localColumns: ColumnChoice[] = localStorageColumns ? JSON.parse(localStorageColumns) : [];
      return masterColumns.map(masterCol => {
        const newCol = localColumns.find(x => x.field === masterCol.field);
        return {
          ...masterCol,
          isChecked: newCol?.isChecked ?? masterCol.isChecked
        }
      });
    }

    setColumnData(type: string, columns: ColumnChoice[]) {
      localStorage.setItem('report.orders-sequence.' + type, JSON.stringify(columns));
      this.apiResolver.resolve(
        'user.settings.preferences@post',
        {key: 'report.orders-sequence.'+type, value: JSON.stringify(columns)}
      );
    }
  }],
};

interface ColumnChoice {
  field: string;
  title: string;
  isChecked: boolean;
  filter?: string;
}

export default OrderSequenceReport_;
