import angular from 'angular';
import * as _ from "lodash";
import { GridOptions } from 'ag-grid-community';
import { Ams } from "../../../../amsconfig";
import { ClientDataStore } from "../../../../core/services/clientData.store";
import {
  SingleOrderModel,
  BundleRules,
  ConsumptionSummaryForOrder,
  ProducedBundlesForOrder,
  SingleOrder
} from '../../../../core/services/store/order/selectors';
import { PatchJobs } from '../../../../core/services/store/scheduler/actions';
import { InitSingleOrder, SetRebundleResult, SaveRebundleResult, CancelBundleResult } from '../../../../core/services/store/order/actions';
import { Put } from '../../../../core/services/clientData.actions';
import { IBundleResult, IJobItem, BadRequestResponse, RebundleResult, IExportEvent, PatternDef, ISystemPreferences } from "../../../../core/dto";
import UpdownPng from '../../../../../assets/icons/png-icon/up-down.png';
import OrderDetailTemplate from './order-detail.html';
import { UserHasRole } from '../../../../core/services/store/user/selectors';
import CombineToNewBundlesDialog from './components/combine-to-new-bundles-dialog.component';
import OrderDefChangeDialog from './components/order-def-change-dialog.component';

declare let gtag;

const OrderDetailComponent = {
  selector: 'orderDetailView',
  template: OrderDetailTemplate,
  bindings: {},
  /** @ngInject */
  controller: ['$scope', '$mdDialog', 'clientDataStore', 'api', '$http', '$stateParams', '$filter', '$mdToast', '$location', '$rootScope',  class OrderDetail {
    order: SingleOrderModel;
    productionData = [];
    consumptionHistory: ReturnType<
      ReturnType<typeof ConsumptionSummaryForOrder>
    > = [];
    producedBundleData: IBundleResult[] = [];
    integrationEvents: any[] = [];

    bundleRules: BundleRules = null;
    bundleCheckState = {};
    itemsCheckState = {};
    ordId: number;
    lastCheckedItemId = 0;
    userHasJobEditorRole = false;

    producedBundleColumns = [
      {
        field: 'bundleCode',
        headerName: 'Id',
      },
      {
        field: 'bundleNumber',
        headerName: 'Bundle',
      },
      {
        field: 'endTime',
        valueFormatter: params => { return this.$filter('amsDateTime')(params.value)},
        headerName: 'completed',
      },
      {
        field: 'totalQty',
        headerName: 'totalPieces',
      },
      {
        field: 'producedLengthIn',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 0, false, 0, 'ft')},
        headerName: 'good',
      },
      {
        field: 'scrapIn',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 0, false, 0, 'ft')},
        headerName: 'scrap',
      },
      //{field: 'scrapPct', cellFilter: 'unitsFormat:"%":0', headerName: 'scrapPercent', headerCellFilter: 'translate'},
      {
        field: 'runMinutes',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "min", 0)},
        headerName: 'running',
      },
      //{field: 'nonExemptMinutes', cellFilter: 'unitsFormat:"min":0', headerName: 'unscheduled', headerCellFilter: 'translate'},
      {
        field: 'longestLengthIn',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 0, false, 0, 'ft')},
        headerName: 'longest',
      },
      {
        field: 'finalMachineNumber',
        headerName: 'machine',
      },
      {
         field: 'bundleCode',
         headerName: 'Tag',
         cellRenderer: params => {
            return `
               <div class="tag-container">
                  <a href="/_api/bundle/${params.value}/tag" class="icon" target="_blank">
                     <md-icon md-font-icon="mdi-file-pdf-box" class="mdi">
                     <md-tooltip md-direction="top">View the bundle tag</md-tooltip>
                     </md-icon>
                  </a>
                  <md-button class="tag-print-button" ng-click="$ctrl.printBundle('${params.value}')">
                     <md-icon md-font-icon="mdi-printer" class="mdi">
                     <md-tooltip md-direction="top">Print the bundle tag</md-tooltip>
                     </md-icon>
                  </md-button>
               </div>
            `;
         },
      },
    ];
    systemPreferences: ISystemPreferences;
    alerts: string[];
    printTemplates: string[] = [];

    productionSummaryColumns = [
      {
         field: 'productionDate',
         headerName: "Production Date",
         hide: false,
         valueFormatter: params => { return this.$filter('amsDate')(params.value)},
      },
      {
         field: 'goodPieceCount',
         headerName: "Total Pieces",
         hide: false,
      },
      {
         field: 'goodFeet',
         headerName: "Good",
         hide: false,
         valueFormatter: params => { return this.$filter('number')(params.value, 2)},
      },
      {
         field: 'scrapFeet',
         headerName: "Scrap",
         hide: false,
         valueFormatter: params => { return this.$filter('number')(params.value, 2)},
      },
      {
         field: 'totalMinutes',
         headerName: "Running",
         hide: false,
      },
      {
         field: 'machine.description',
         headerName: "Machine",
         hide: false,
      },
      {
         field: 'coilSerialNumber',
         headerName: "Coil ID",
         hide: false,
      },

    ];
    productionSummaryAgGridOptions: GridOptions = {

      headerHeight: 25,
      defaultColDef: {
         sortable: true,
      },
      columnDefs: this.productionSummaryColumns,
      onGridReady: () => {
         this.loadProductionSummary();
      },
   };
    consumptionSummarySub_;

    bundleAgGridOptions: GridOptions = {

      headerHeight: 25,
      defaultColDef: {
         sortable: true,
         headerValueGetter: params => {return this.$filter('translate')(params.colDef.headerName)},
      },
      columnDefs: this.producedBundleColumns,
      onGridReady: () => {
         this.loadBundleData();
      },
   };
   bundlesSub_;
   bundleHeight = 0;
   summaryHeight = 0;
   integrationHeight = 0;
   integrationColumns = [
      {
        field: 'channel',
        headerName: 'Channel',
      },
      {
        field: 'itemId',
        headerName: 'Item',
      },
      {
        field: 'complete',
        headerName: 'Complete',
      },
      {
         field: 'itemId',
         headerName: 'Action',
         cellRenderer: params => {
            return params.data.complete ? `` : `<div class="agGrid-button">
                <md-button
                  ng-click="$ctrl.triggerExport('${params.value}')"
                  aria-label="Export"
                >
                  <md-tooltip>Retry export attempt</md-tooltip>
                  <md-icon md-font-icon="mdi-upload" class="mdi"></md-icon>
                </md-button>
                <md-button
                  ng-click="$ctrl.cancelExport('${params.value}')"
                  aria-label="Export"
                >
                  <md-tooltip>Cancel export attempt</md-tooltip>
                  <md-icon md-font-icon="mdi-close-circle-outline" class="mdi"></md-icon>
                </md-button>
              </div>
            `;
         },
      },
      {
        field: 'stage',
        headerName: 'Stage',
      },
      {
        field: 'receivedTime',
        valueFormatter: params => { return this.$filter('date')(params.value, "short")},
        headerName: 'Received',
      },
      {
        field: 'executionDuration',
        valueFormatter: params => { return this.$filter('timeSpan')(params.value, "secondsWithMs")},
        headerName: 'Duration',
      },
      {
        field: 'attemptCount',
        headerName: 'Attempts',
      },
      {
         field: 'activityLog',
         headerName: 'Messages',
         autoHeight: true,
         wrapText: true,
         cellRenderer: params => {
          // params.value is a collection of strings. We want to display each string on a new line.
          let messages = '';
          params.value.forEach(message => {
            messages += '<div style="text-align:left">' + message + '</div>';
          });
          return messages;
         },
      },
    ];
   integrationAgGridOptions: GridOptions = {

      headerHeight: 25,
      defaultColDef: {
         sortable: true,
         headerValueGetter: params => {return this.$filter('translate')(params.colDef.headerName)},
      },
      columnDefs: this.integrationColumns,
      onGridReady: () => {
         this.loadIntegrations();
      },
   };
   integrationEventsSub_;

    constructor(
      $scope: angular.IScope,
      private $mdDialog,
      private clientDataStore: ClientDataStore,
      private api,
      private $http: angular.IHttpService,
      $stateParams: { id: string },
      private $filter,
      private $mdToast,
      private $location: angular.ILocationService,
      private $rootScope
    ) {
      this.ordId = (this.ordId = Number($stateParams.id));

      clientDataStore.Dispatch(new InitSingleOrder(this.ordId));

      this.clientDataStore
         .Selector(state => state.SystemPreferences)
         .subscribe(prefs => {
            this.systemPreferences = prefs;
         });

      // Data Subscriptions
      const filter: { property: 'ordId'; values: (string | number)[] } = {
        property: 'ordId',
        values: [this.ordId],
      };
      const jobDetailsFilterSub_ = clientDataStore
        .SelectJobDetailIn(filter)
        .subscribe();
      const consumptionSummaryFilterSub_ = clientDataStore
        .SelectConsumptionHistoryIn(filter)
        .subscribe();
      const bundlesFilterSub_ = clientDataStore
        .SelectBundleResultsIn(filter)
        .subscribe();

      this.getBundleRules(this.ordId);

      const jobDetailsSub_ = clientDataStore.Selector(SingleOrder(this.ordId)).subscribe(singleOrder => {
        if (singleOrder) {
          this.order = singleOrder;

          // Preserve the local sort - if there is one
          const idxColWithASort = this.itemHeaders.findIndex(
            h => h.order !== 'none'
          );
          if (idxColWithASort > -1) this.onOrderItems(idxColWithASort);

          this.updateAlerts();
          this.updateBundleChecksFromItems();
        }
      });

      // todo: add this to the store and subscribe to updates
   //    Rx.Observable.fromPromise(
   //      this.$http.get<IExportEvent[]>(
   //         Ams.Config.BASE_URL + `/_api/integration/eventsForRelated`,
   //         { params: {id: `JobDetail/${this.ordId}`} }
   //      )
   //   ).subscribe((response) => {
   //     console.log('integration events', response);
   //     this.integrationEvents = response.data;
   //   });

      this.api.user.settings.orderItemsColumns.get(
        {},
        userColumns => {
          this.itemHeaders.forEach(x => {
            x.isVisible =
              userColumns.find(u => u.field === x.field)?.isChecked ??
              x.isVisible;
          });
        },
        error => {
          console.error(error);
        }
      );

      this.api.orders.printTemplates.get(
        {},
        printTemplates => {
          this.printTemplates = printTemplates;
        },
        error => {
          console.error(error);
        }
      );

      $scope.$on('$destroy', () => {
        jobDetailsFilterSub_.dispose();
        jobDetailsSub_.dispose();
        consumptionSummaryFilterSub_.dispose();
        this.consumptionSummarySub_.dispose();
        bundlesFilterSub_.dispose();
        this.bundlesSub_.dispose();
        userRoleSub_.dispose();
        this.$rootScope.$broadcast('warningSaved', false);
      });

      const userRoleSub_ = clientDataStore
        .Selector(UserHasRole('job-editor'))
        .subscribe((userHasJobEditorRole: boolean) => {
          this.userHasJobEditorRole = userHasJobEditorRole;
        });
    }

    private toastUserCanNotEdit() {
      this.$mdToast.show({
        position: 'bottom right',
        template:
          '<md-toast>' +
          '<span flex>This Order is in read-only mode as the current user is not a member of the <em>job-editor</em> role.</span>' +
          '</md-toast>',
      });
    }

    loadProductionSummary() {
      this.consumptionSummarySub_ = this.clientDataStore
        .Selector(ConsumptionSummaryForOrder(this.ordId))
        .subscribe(consumptionHistory => {
            this.summaryHeight = (consumptionHistory.length + 1) * 28;
            this.productionSummaryAgGridOptions.api.setRowData(consumptionHistory);
            this.productionSummaryAgGridOptions.api.sizeColumnsToFit();
        });
    }

    loadBundleData() {
      this.bundlesSub_ = this.clientDataStore
        .Selector(ProducedBundlesForOrder(this.ordId))
        .subscribe(producedBundleData => {
         this.bundleHeight = (producedBundleData.length + 1)*28;
         this.bundleAgGridOptions.api.setRowData(producedBundleData);
         this.bundleAgGridOptions.api.sizeColumnsToFit();
        });
    }

    loadIntegrations() {
      this.integrationEventsSub_ = Rx.Observable.fromPromise(
         this.$http.get<IExportEvent[]>(
            Ams.Config.BASE_URL + `/_api/integration/eventsForRelated`,
            { params: {id: `JobDetail/${this.ordId}`} }
         )
      ).subscribe((response) => {
         this.integrationHeight = (response.data.length + 1)*128; // this was 28 but I want multi line messages to be visible
        this.integrationAgGridOptions.api.setRowData(response.data);
         this.integrationAgGridOptions.api.sizeColumnsToFit();
      });
    }

    selectedBundleCount() {
      return Object.values(this.bundleCheckState).filter(x => x).length;
    }

    selectedBundleNos(): number[] {
      return Object.keys(this.bundleCheckState)
        .filter(key => this.bundleCheckState[key])
        .map(Number);
    }

    onBundleChecked(bundleNo: number) {
      this.bundleCheckState[bundleNo] = !this.bundleCheckState[bundleNo];
      let checked = this.bundleCheckState[bundleNo];
      this.order.items
        .filter(i => i.bundle === bundleNo)
        .forEach(i => (this.itemsCheckState[i.itemId] = checked));
    }

    updateBundleChecksFromItems() {
      this.order.bundlesModel.forEach(b => {
        let x = this.order.items
          .filter(i => i.bundle === b.bundleNo)
          .every(i => this.itemsCheckState[i.itemId] === true);
        this.bundleCheckState[b.bundleNo] = x;
      });
    }

    updateAlerts() {
      this.alerts = [];
      if (this.order.job.materialShortageAlert && this.systemPreferences.showMaterialShortageAlerts) {
        this.alerts.push('Material Shortage');
      }
      if (this.order.job.patternNotDefined) {
        this.alerts.push('Pattern Not Defined');
      }
    }

    doBundleAction(action: string) {
      console.log('Bundle action:', action);
    }

    itemHeaders: {
      field: keyof (IJobItem & { isVisible });
      order: 'asc' | 'desc' | 'none';
      title: string;
      isVisible: boolean;
      isEditable: boolean;
      units: string;
      unitDecimals: number;
    }[] = [
        {
          field: 'bundle',
          order: 'none',
          title: 'Bundle',
          isVisible: true,
          isEditable: false,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'lengthIn',
          order: 'none',
          title: 'Length',
          isVisible: true,
          isEditable: false,
          units: 'in',
          unitDecimals: 3,
        },
        {
          field: 'quantity',
          order: 'none',
          title: 'Pieces',
          isVisible: true,
          isEditable: false,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'quantityDone',
          order: 'none',
          title: 'Pcs Done',
          isVisible: true,
          isEditable: false,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'patternName',
          order: 'none',
          title: 'Pattern',
          isVisible: true,
          isEditable: false,
          units: '',
          unitDecimals: 0,
          //sref: 'app.punch-patterns_list.detail({id: pattern.patternName})'
        },
        {
          field: 'weightLbs',
          order: 'none',
          title: 'Weight',
          isVisible: true,
          isEditable: false,
          units: 'lbs',
          unitDecimals: 0,
        },
        {
          field: 'sequence',
          order: 'asc',
          title: 'Sequence',
          isEditable: false,
          isVisible: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'externalItemId',
          order: 'none',
          title: 'Item ID',
          isVisible: true,
          isEditable: false,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'user1',
          order: 'none',
          title: 'itemUser1',
          isVisible: false,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'user2',
          order: 'none',
          title: 'itemUser2',
          isVisible: false,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'user3',
          order: 'none',
          title: 'itemUser3',
          isVisible: false,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'user4',
          order: 'none',
          title: 'itemUser4',
          isVisible: false,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'user5',
          order: 'none',
          title: 'itemUser5',
          isVisible: false,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'messageText',
          order: 'none',
          title: 'Message',
          isVisible: true,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'pieceMark',
          order: 'none',
          title: 'Piece Mark',
          isVisible: true,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
        {
          field: 'bundleGroup',
          order: 'none',
          title: 'bundleGroup',
          isVisible: true,
          isEditable: true,
          units: '',
          unitDecimals: 0,
        },
      ];

    bundleChoices: { id: number; text: string }[] = [];

    onItemGridOptionsToggle(column) {
      column.isVisible = !column.isVisible;

      let data = this.itemHeaders.map(x => ({
        field: x.field,
        isChecked: x.isVisible,
      }));
      this.api.user.settings.orderItemsColumns.post(data);
    }

    private onOrderItems(index) {
      const clickedHeader = this.itemHeaders[index];
      let sortOrder: 'asc' | 'desc' =
        clickedHeader.order === 'desc' ? 'desc' : 'asc'; // this is probably not needed but don't want to accidentally send 'none' to orderBy.
      this.order.items = _.orderBy(
        this.order.items,
        clickedHeader.field,
        sortOrder
      );
    }

    onClickItemHeader = index => {
      let nextOrder: 'asc' | 'desc' =
        this.itemHeaders[index].order === 'asc' ? 'desc' : 'asc'; // cycle between asc and desc. If none, start with asc.

      this.itemHeaders.forEach(item => {
        item.order = 'none';
      });
      this.itemHeaders[index].order = nextOrder;
      this.onOrderItems(index);
    };

    onOrderChangeItemHeader = index => {
      let orderedItem = this.itemHeaders[index];
      if (orderedItem.order === 'asc') {
        orderedItem.order = 'desc';
      } else {
        orderedItem.order = 'asc';
      }

      this.onOrderItems(index);
    };

    itemsCheckedCount() {
      let x = Object.values(this.itemsCheckState).filter(x => x).length;
      return x;
    }

    onItemClicked = (item: IJobItem, $event) => {
      console.log($event);
      let isShifted = $event.shiftKey;
      // this might be tricky to determine. ng-click happens before the model is updated.
      // So, the inverse of the current checked value
      let isChecked = this.itemsCheckState[item.itemId] ?? false;
      if (!isChecked) {
        // using the inverse here
        if (isShifted && this.lastCheckedItemId !== 0) {
          // get range
          let lastIndex = this.order.items
            .map(i => i.itemId)
            .indexOf(this.lastCheckedItemId);
          let thisIndex = this.order.items
            .map(i => i.itemId)
            .indexOf(item.itemId);
          if (lastIndex < 0 || thisIndex < 0) {
            console.error(
              `unexpected range clicked. Last id:${this.lastCheckedItemId} (${lastIndex}), this id:${item.itemId} (${thisIndex})`
            );
            this.lastCheckedItemId = 0;
            return;
          }
          for (
            let x = Math.min(lastIndex, thisIndex);
            x < Math.max(lastIndex, thisIndex);
            x++
          ) {
            if (x !== thisIndex)
              // don't modify the clicked item
              this.itemsCheckState[this.order.items[x].itemId] = true;
          }
        }
        this.lastCheckedItemId = item.itemId;
      } else {
        this.lastCheckedItemId = 0; //??
      }
    };
    onItemChanged = (item: IJobItem) => {
      this.updateBundleChecksFromItems();
    };

    isAllJobItemChecked = () =>
      this.order.items.every(i => this.itemsCheckState[i.itemId]);

    isJobItemIndeterminate = () =>
      this.order.items.some(i => this.itemsCheckState[i.itemId]) &&
      !this.isAllJobItemChecked();

    isBundleItemIndeterminate = (bundleNo: number) =>
      this.order.items
        .filter(i => i.bundle === bundleNo)
        .some(i => this.itemsCheckState[i.itemId]) &&
      !this.bundleCheckState[bundleNo];

    onJobItemToggleAll = () => {
      const checkAllOrNone = this.itemsCheckedCount() < this.order.items.length;
      this.order.items.forEach(item => {
        this.itemsCheckState[item.itemId] = checkAllOrNone;
      });
      this.updateBundleChecksFromItems();
    };

    savePacket: { value: string; path: string; op: string }[] = [];
    isPatchPending() {
      return this.savePacket.length > 0;
    }
    isRebundlePending() {
      return this.order.rebundleResult ? true : false;
    }
    assertNoPatchPending() {
      if (this.isPatchPending()) {
        this.$mdToast.show(
          this.$mdToast
            .simple()
            .textContent(
              'Cannot make this change until current changes are saved.'
            )
            .position('top right')
            .hideDelay(2000)
            .parent('#content')
        );
        return true;
      }
      return false;
    }
    assertNoRebundlePending() {
      if (this.isRebundlePending()) {
        this.$mdToast.show(
          this.$mdToast
            .simple()
            .textContent(
              'Cannot make this change until rebundling changes are saved.'
            )
            .position('top right')
            .hideDelay(2000)
            .parent('#content')
        );
        return true;
      }
      return false;
    }
    gotSaveableChanges() {
      return this.savePacket.length > 0;
    }
    onChangeOrderDetail(value: number | string, path: string) {
      if (this.assertNoRebundlePending()) {
        return;
      }
      if (typeof value === 'number') {
        // Server requires a string, not a number.
        value = value.toString();
      }

      // remove any existing patches for this path
      this.savePacket = this.savePacket.filter(s=>s.path !== path);

      this.savePacket.push({ value, path, op: 'replace' });
      this.$rootScope.$broadcast('warningSaved', true);
    }

    onChangeItem(value: number | string, path: string, item) {
      if (this.assertNoRebundlePending()) {
        return;
      }
      if (typeof value === 'number') {
        // Server requires a string, not a number.
        value = value.toString();
      }
      const packet = {
        value: value.toString(),
        path: `/items/${item.itemId}/${path}`,
        op: 'replace',
      };
      console.log(`save item`, packet);

      // remove any existing patches for this path
      this.savePacket = this.savePacket.filter(s=>s.path !== packet.path);

      this.savePacket.push(packet);
      this.$rootScope.$broadcast('warningSaved', true);
    }

    onChangeItemBundle(value: number | 'new', item: IJobItem) {
      if (this.assertNoPatchPending()) {
        return;
      }

      // If items are checked and the item that is being changed is checked, send the list. Otherwise, only send the item being changed.
      let itemIds =
        this.CheckedItemIds.indexOf(item.itemId) >= 0
          ? this.CheckedItemIds
          : [item.itemId];

      this.$http
        .post<RebundleResult>(
          `${Ams.Config.BASE_URL}/api/ordercommand/rebundle/combineitems`,
          {
            ordId: this.ordId,
            items: this.order.items,
            itemIds: itemIds,
            targetBundle: value === 'new' ? -1 : value,
            bundleGroupField: 'none',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(result => {
          console.table(result.data.rebundledItems);
          this.dispatchBundleResult(result.data);
        })
        .catch(ex => {
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent('Order update failed: ' + ex.data.errors.join('\n'))
              .position('top right')
              .hideDelay(2000)
              .parent('#content')
          );
        });
    }

    loadBundleChoices(item: IJobItem) {
      this.bundleChoices = this.order.items
        .map(i => i.bundle)
        // Distinct
        .reduce<number[]>((acc, x) => (acc.includes(x) ? acc : [...acc, x]), [])
        .map(bn => ({
          id: bn,
          text: bn.toString(),
        }));

      const allowSplit =
        this.order.items.filter(x => x.bundle === item.bundle).length > 1;

      // Split to new is a nullop when the item is in a bundle by itself.
      if (allowSplit)
        // -1 is the magic number for new bundle
        this.bundleChoices.push({ id: -1, text: 'New' });
    }

    saveOrderDetailChanges() {
      console.log('saving', this.savePacket);
      if (!this.userHasJobEditorRole) {
        this.toastUserCanNotEdit();
        return;
      }
      this.$http
        .patch(
          `${Ams.Config.BASE_URL}/api/ordercommand/${this.ordId}/savechanges`,
          { operations: this.savePacket }
        )
        .then(
          _ => {
            let packetSize = this.savePacket.length;
            this.savePacket = []; // success
            this.$rootScope.$broadcast('warningSaved', false);
            this.$mdToast.show(
              this.$mdToast
                .simple()
                .textContent('Order updates saved')
                .position('top right')
                .hideDelay(2000)
                .parent('#content')
            );
            gtag('event', 'orderDetail_save', {
              event_category: 'orderDetail',
              event_label: 'Changes',
              value: packetSize,
            });
          },
          (ex: { data: BadRequestResponse }) => {
            this.$mdToast.show(
              this.$mdToast
                .simple()
                .textContent(
                  'Order update failed: ' + ex.data.errors.join('\n')
                )
                .position('top right')
                .hideDelay(2000)
                .parent('#content')
            );
          }
        );
    }

    changeOrderDef() {
      if (!this.userHasJobEditorRole) {
        this.toastUserCanNotEdit();
        return;
      }
      if (this.assertNoPatchPending()) {
        return;
      }

      this.$mdDialog
        .show({
          ...OrderDefChangeDialog,
          locals: {
            ordId: this.ordId,
            orderCode: this.order.job.orderCode,
            materialCode: this.order.job.materialCode,
            toolingCode: this.order.job.toolingCode
          },
        })
        .then(result => {
          //this.clientDataStore.Dispatch(new SetOrderDefChange(result));
          console.log('result', result);
        });
    }

    onDeleteJob() {
      console.log('saving', this.savePacket);
      if (!this.userHasJobEditorRole) {
        this.toastUserCanNotEdit();
        return;
      }
      this.$http.delete(Ams.Config.BASE_URL + `/api/job/${this.ordId}`).then(
        _ => {
          gtag('event', 'orderDetail_deleteOrder', {
            event_category: 'orderDetail',
          });
          this.$location.path('/orders');
        },
        _ => {
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent('Order delete failed')
              .position('top right')
              .hideDelay(2000)
              .parent('#content')
          );
        }
      );
    }

    bundlesActions = [
      {
        key: 'Resequence Bundles: Long to Short',
        doBundlesAction: () => this.resequence('BundlesByLengthDesc'),
        allowed: () => this.order.allowRebundling,
      },
      {
        key: 'Resequence Bundles: Short to Long',
        doBundlesAction: () => this.resequence('BundlesByLengthAsc'),
        allowed: () => this.order.allowRebundling,
      },
    ];
    itemsActions = [
      {
        key: 'Auto Rebundle Selected',
        doItemsAction: () => this.rebundleSelectedItems(),
        allowed: () => this.order.allowRebundling,
      },
      {
        key: 'Split Selected To Multiple Items...',
        doItemsAction: () => this.splitSelectedItems(),
        allowed: () => this.order.allowRebundling,
      },
      {
        key: 'Combine Selected To New Bundle(s)...',
        doItemsAction: () => this.combineSelectedItems(),
        allowed: () => this.order.allowRebundling,
      },
      {
        key: 'Resequence: By Bundle',
        doItemsAction: () => this.resequence('ByBundleNum'),
        allowed: () => this.order.allowRebundling,
      },
      {
        key: 'Resequence: By Bundle, then Long to Short',
        doItemsAction: () => this.resequence('ByBundleNumAscThenLengthDesc'),
        allowed: () => this.order.allowRebundling,
      },
      {
        key: 'Resequence: By Bundle, then Short to Long',
        doItemsAction: () => this.resequence('ByBundleNumAscThenLengthAsc'),
        allowed: () => this.order.allowRebundling,
      },
    ];
    bundlesViews = [
      { icon: '', title: 'Collapsed', id: 0 },
      { icon: '', title: 'Carousel', id: 1 },
      { icon: '', title: 'Line Detail', id: 2 },
    ];
    selectedBundleView = this.bundlesViews[0];
    changeBundleView(view) {
      this.selectedBundleView = view;
    }
    get CheckedItemIds(): number[] {
      // Multiple rebundling operations can mean that itemsCheckState
      // contains members that refer to items that no longer exist.
      const existing = this.order.items.map(x => x.itemId);
      return Object.keys(this.itemsCheckState)
        .filter(key => this.itemsCheckState[key])
        .map(Number)
        .filter(x => existing.includes(x));
    }
    get CheckedItems(): IJobItem[] {
      let checkedIds = this.CheckedItemIds;
      return this.order.items.filter(x => checkedIds.includes(x.itemId));
    }
    rebundleSelectedItems() {
      console.log('rebundling items action');
      if (this.assertNoPatchPending()) {
        return;
      }
      //const itemsToRebundle = this.CheckedItems;
      const items = this.order.items;
      const itemIds = this.CheckedItemIds;

      this.rebundleItems({
        items: items,
        itemIds: itemIds,
        rules: this.bundleRules,
        ordId: this.ordId,
      });
    }

    rebundleItems(args: {
      items: IJobItem[];
      itemIds: number[];
      rules: BundleRules;
      ordId: number;
    }) {
      this.$http
        .post<RebundleResult>(
          `${Ams.Config.BASE_URL}/api/ordercommand/rebundle`,
          args
        )
        .then(
          result => {
            this.dispatchBundleResult(result.data);
            gtag('event', 'orderDetail_rebundleItems', {
              event_category: 'orderDetail',
              event_label: 'Count',
              value: args.itemIds.length,
            });
          },
          (err: { data: BadRequestResponse }) => {
            this.$mdToast.show(
              this.$mdToast
                .simple()
                .textContent('Rebundle failed: ' + err.data.errors.join('\n'))
                .position('top right')
                .hideDelay(2000)
                .parent('#content')
            );
          }
        );
    }
    resequence(
      strategy:
        | 'ByBundleNumAscThenLengthDesc'
        | 'ByBundleNumAscThenLengthAsc'
        | 'ByBundleNum'
        | 'BundlesByLengthDesc'
        | 'BundlesByLengthAsc'
    ) {
      if (this.CheckedItems.length !== this.order.items.length) {
        this.$mdToast.show(
          this.$mdToast
            .simple()
            .textContent(
              `Resequencing does not apply to a partial order. Select all the items.`
            )
            .position('top right')
            .hideDelay(2000)
            .parent('#content')
        );
        return;
      }

      this.$http
        .post<RebundleResult>(
          `${Ams.Config.BASE_URL}/api/ordercommand/rebundle/resequencebystrategy`,
          {
            ordId: this.ordId,
            items: this.order.items,
            strategy: strategy,
          }
        )
        .then(
          result => {
            this.dispatchBundleResult(result.data);
          },
          (err: { data: BadRequestResponse }) => {
            this.$mdToast.show(
              this.$mdToast
                .simple()
                .textContent('Rebundle failed: ' + err.data.errors.join('\n'))
                .position('top right')
                .hideDelay(2000)
                .parent('#content')
            );
          }
        );
    }

    cancelUnsavedChanges() {
      let packetSize = this.savePacket.length;
      this.savePacket = [];
      this.$rootScope.$broadcast('warningSaved', false);
      this.clientDataStore.Dispatch(new CancelBundleResult());
      gtag('event', 'orderDetail_cancel', {
        event_category: 'orderDetail',
        event_label: 'Bundles',
        value: packetSize,
      });
    }
    saveBundleChanges() {
      if (!this.userHasJobEditorRole) {
        this.toastUserCanNotEdit();
        return;
      }
      let packetSize = this.savePacket.length;
      this.clientDataStore.Dispatch(
        new SaveRebundleResult(this.order.ordId, this.order.rebundleResult)
      );
      gtag('event', 'orderDetail_save', {
        event_category: 'orderDetail',
        event_label: 'Bundles',
        value: packetSize,
      });
    }
    splitSelectedItems() {
      if (this.assertNoPatchPending()) {
        return;
      }
      const items = this.order.items;
      const itemIds = this.CheckedItemIds;
      const ordId = this.ordId;
      const clientDataStore = this.clientDataStore;

      this.$mdDialog.show({
        /** @ngInject */
        controller: ['ordId', 'items', 'itemIds', 'maxPieces', 'maxWeight', function SplitDialogController(ordId, items, itemIds, maxPieces, maxWeight) {
          let ctrl = this;
          ctrl.ordId = ordId;
          ctrl.items = items;
          ctrl.itemIds = itemIds;
          ctrl.maxPieces = maxPieces;
          ctrl.maxWeight = maxWeight;
        }],
        controllerAs: '$ctrl',
        template:
          '<split-modal items="$ctrl.items" item-ids="$ctrl.itemIds" ord-id="$ctrl.ordId" max-pieces="$ctrl.maxPieces" max-weight="$ctrl.maxWeight"></split-modal>',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        locals: {
          ordId: this.ordId,
          items: this.order.items,
          itemIds: this.CheckedItemIds,
          maxPieces: this.order.bundlesModel[0].maxPieces || 0,
          maxWeight: this.order.bundlesModel[0].maxWeightLbs || 0,
        },
      });
    }

    combineSelectedItems() {
      if (this.assertNoPatchPending()) {
        return;
      }

      this.$mdDialog
        .show({
          ...CombineToNewBundlesDialog,
          locals: {
            ordId: this.ordId,
            items: this.order.items,
            itemIds: this.CheckedItemIds,
          },
        })
        .then(result => {
          this.dispatchBundleResult(result);
          gtag('event', 'orderDetail_combineItems', {
            event_category: 'orderDetail',
            event_label: 'Count',
            value: this.CheckedItemIds.length,
          });
        });
    }

    resequenceItems(nextSeq: number) {
      if (this.assertNoPatchPending()) {
        return;
      }
      console.log('pre-reseq', this.itemsCheckState);
      const items = this.order.items;
      const itemIds = this.CheckedItemIds;
      const ordId = this.ordId;
      const clientDataStore = this.clientDataStore;
      this.$http
        .post<RebundleResult>(
          `${Ams.Config.BASE_URL}/api/ordercommand/rebundle/resequence`,
          {
            ordId,
            items,
            itemIds,
            targetSeqPos: nextSeq,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(result => {
          console.table(result.data.rebundledItems);
          this.dispatchBundleResult(result.data);
          gtag('event', 'orderDetail_resequenceItems', {
            event_category: 'orderDetail',
            event_label: 'Count',
            value: items,
          });
        })
        .catch(ex => {
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent('Order update failed: ' + ex.data.errors.join('\n'))
              .position('top right')
              .hideDelay(2000)
              .parent('#content')
          );
        });
    }

    dispatchBundleResult(result: RebundleResult) {
      console.log('hasUnsavedBundleChanges');
      this.$rootScope.$broadcast('warningSaved', true);

      this.clientDataStore.Dispatch(new SetRebundleResult(result));
    }

    moveSequenceUp() {
      const checkedItems = this.CheckedItems;
      let minSeq = Math.min(...checkedItems.map(i => i.sequence));
      this.resequenceItems(Math.max(minSeq - 1, 1));
    }

    canMoveSequenceUp() {
      // If it's position in the short checked items array is the same as it's
      // sequence, then it can't be moved.
      return (
        this.CheckedItems.filter((item, i) => item.sequence !== i + 1).length >
        0
      );
    }

    moveSequenceDown() {
      const checkedItems = this.CheckedItems;
      // we still take the min sequence otherwise it steps by the selected count
      let minSeq = Math.min(...checkedItems.map(i => i.sequence));
      this.resequenceItems(minSeq + 1);
    }

    canMoveSequenceDown(): boolean {
      return (
        this.CheckedItems.filter(
          (item, i, items) =>
            item.sequence !== this.order.items.length - (items.length - i - 1)
        ).length > 0
      );
    }

    slickConfig4 = {
      method: {},
      dots: false,
      infinite: false,
      speed: 300,
      slidesToShow: 1,
      centerMode: false,
      variableWidth: true,
    };

    openDialog = ev => {
      this.$mdDialog.show({
        /** @ngInject */
        controller: ['$mdDialog', '$timeout', function RebundleDialogController(
          $mdDialog,
          $timeout: angular.ITimeoutService
        ) {
          let ctrl = this;

          ctrl.getValue = () => { };

          ctrl.init = function () {
            ctrl.pieces = ['Piece1', 'Piece2', 'Piece3'];
            ctrl.selectedPieces = '';
          };

          ctrl.cancel = () => {
            $mdDialog.cancel();
          };

          ctrl.save = () => {
            $mdDialog.hide();
          };

          ctrl.init();
        }],
        controllerAs: 'ctrl',
        templateUrl: 'app/main/apps/orders/detail/item-settings.dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {},
        onRemoving: (event, removePromise) => { },
      });
    };

    summaryHeaders = [
      {
        item: 'productionDate',
        order: 'asc',
        title: 'Production Date',
        checked: false,
      },
      {
        item: 'goodPieceCount',
        order: 'asc',
        title: 'Total Pieces',
        checked: false,
      },
      { item: 'goodFeet', order: 'asc', title: 'Good', checked: false },
      { item: 'scrapFeet', order: 'asc', title: 'Scrap', checked: true },
      {
        item: 'totalMinutes',
        order: 'asc',
        title: 'Running',
        checked: false,
      },
      {
        item: 'machineNumber',
        order: 'asc',
        title: 'Machine',
        checked: false,
      },
      {
        item: 'coilSerialNumber',
        order: 'asc',
        title: 'Coil ID',
        checked: false,
      },
    ];

    onOrderSummaries = index => {
      const selectedItem = this.summaryHeaders[index];
      let secondItem;
      if (index === 6) {
        secondItem = this.summaryHeaders[0];
      } else {
        secondItem = this.summaryHeaders[index + 1];
      }
      this.consumptionHistory = _.orderBy(
        this.consumptionHistory,
        [selectedItem.item, secondItem.item],
        [selectedItem.order, secondItem.order]
      );
    };

    onClickSummaryHeader = index => {
      this.summaryHeaders.forEach(item => {
        item.checked = false;
      });
      this.summaryHeaders[index].checked = true;
      this.onOrderSummaries(index);
    };

    onOrderChangeSummaryHeader = index => {
      let orderedItem = this.summaryHeaders[index];
      if (orderedItem.order === 'asc') {
        orderedItem.order = 'desc';
      } else {
        orderedItem.order = 'asc';
      }

      this.onOrderSummaries(index);
    };

    openScheduleMenu = function ($mdMenu, ev) {
      $mdMenu.open(ev);
    };

    scheduleCommand = function (cmd) {
      console.log('schedule command:' + cmd.action);
      this.$http.post(`${Ams.Config.BASE_URL}/api/scheduleCommand`, cmd);
      //todo:modify the status until an update comes
      this.order.job.status = '...';
    };

    getBundleRules(ordId: number) {
      this.api.orders.details.bundleRules.get(
        { id: ordId },
        rules => {
          this.bundleRules = rules;
          this.clientDataStore.Dispatch(new Put('BundleRules', rules));
        },
        error => {
          console.error(error);
        }
      );
    }

    onToggleHold() {
      // if (!this.userHasSchedulerRole) {
      //   this.toastUserCanNotSchedule();
      //   return;
      // }

      const hold = !this.order.job.hold;
      this.$http({
        url: `${Ams.Config.BASE_URL}/api/orders/sethold`,
        method: 'POST',
        params: { ordIds: this.ordId, hold },
      }).then(
        _ => this.clientDataStore.Dispatch(new PatchJobs(this.ordId, { hold })),
        ex =>
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent(
                `Error: Schedule change was not saved. Most likely your Agent service is not running. [${ex.statusText}]`
              )
              .position('top right')
              .hideDelay(2000)
              .parent('#content')
          )
      );
    }

    onGetBundleHeight() {
      return {
         height: `${this.bundleHeight > 100 ? this.bundleHeight : 100}px`
      }
    }

    onGetSummaryHeight() {
      return {
         height: `${this.summaryHeight > 100 ? this.summaryHeight : 100}px`
      }
    }

    onGetIntegrationHeight() {
      return {
         height: `${this.integrationHeight > 100 ? this.integrationHeight : 100}px`
      }
    }

    printBundle(bundleCode: string) {
      this.$http({
        url: `${Ams.Config.BASE_URL}/_api/bundle/${bundleCode}/print`,
        method: 'POST',
      })
        .then(result =>
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent(result.data)
              .position('top right')
              .hideDelay(2000)
              .parent('#bundles')
          )
        )
        .catch(reason =>
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent('Print failed.\n' + reason.data.errors.join('\n'))
              .position('top right')
              .hideDelay(2000)
              .parent('#bundles')
          )
        );
    }

    triggerExport = (itemId: string) => {
      console.log('export:' + itemId);
      this.$http.post(
        Ams.Config.BASE_URL +
        `/_api/integration/retryExportAction?item=${itemId}`,
        {}
      );
    };

    cancelExport = (id: string) => {
      console.log('canceling export:' + id);
      this.$http.post(
        Ams.Config.BASE_URL + `/_api/integration/cancelExportAction?id=${id}`,
        {}
      );
    };

    loadImage = function () {
      return UpdownPng;
    }

    createPatternForName(patternName: string) {
      console.log(`create pattern ${patternName}`);
      this.$location.path('/punch-patterns/new').search({name: patternName});
    }

    onChangePattern(patternName: string, item) {
      console.log(`change pattern ${patternName}`);
      this.onChangeItem(patternName, 'punchPattern', item);
    }
  }],
};

export default OrderDetailComponent;
