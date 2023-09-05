import * as angular from "angular";
import { IJobSummaryDto, ISystemPreferences, IUserColumnChoice } from "../../../../core/dto";
import { ClientDataStore } from "../../../../core/services/clientData.store";
import OrderListTemplate from './orders-list.html';
import { IApiResolverService } from "../../../../reference";
import { Ams } from "../../../../amsconfig";
import BulkEditDialog from "./bulk-edit-dialog.component";
import BulkDeleteDialog from "./bulk-delete-dialog.component";
import { GridOptions } from 'ag-grid-community';
import * as _ from "lodash";
import { BehaviorSubject } from "rx";
declare let gtag;

const OrderList = {
  selector: 'orderList',
  template: OrderListTemplate,
  bindings: {},
  /** @ngInject */
  controller: ['$scope', '$mdMedia', 'clientDataStore', '$location', '$filter', 'apiResolver', '$mdDialog', '$http', '$mdToast', class OrderListComponent {
    // Data
    searchTxt = '';
    selectedOrdIds = [];
    searchParams = {};
    ordersSub_;
    agGridOptions: GridOptions;
    knownJobIds: string[] = [];
    daysAgo: number = 7;
    daysAgoObs = new BehaviorSubject({daysAgo: this.daysAgo});

    // ordersGridOptions = {
    //   enableSorting: true,
    //   enableRowSelection: true,
    //   enableSelectAll: true,
    //   selectionRowHeaderWidth: 35,
    //   rowHeight: 35,
    //   data: [],
    //   columnDefs: [],
    //   onRegisterApi: (gridApi) => {
    //     this.ordersGridApi = gridApi;
    //     this.ordersGridApi.grid.registerRowsProcessor((data) => this.singleFilter(data), 200);
    //     this.ordersGridApi.selection.on.rowSelectionChanged(null, row => {
    //       this.updateSelection();
    //     });
    //     this.ordersGridApi.selection.on.rowSelectionChangedBatch(null, rows => {
    //       this.updateSelection();
    //     });
    //     this.ordersGridApi.core.on.sortChanged(null, (grid, sortColumns) => {
    //       if (sortColumns.length > 0) {
    //         this.sortedField = sortColumns[0].field;
    //         this.sortedDirection = sortColumns[0].sort.direction;
    //       } else {
    //         this.sortedField = '';
    //       }
    //       localStorage.setItem('orders.sortField', this.sortedField);
    //       localStorage.setItem('orders.sortDirection', this.sortedDirection);
    //     });
    //   },
    // };

    ordersActions = [
      {
        key: 'Bulk Edit Field',
        doItemsAction: () => this.bulkEditField(),
        allowed: () => true,
      },
      {
        key: 'Delete Order(s)',
        doItemsAction: () => this.bulkDelete(),
        allowed: () => true,
      },
      {
        key: 'Set Hold',
        doItemsAction: () => this.setHold(true),
        allowed: () => true,
      },
      {
        key: 'Release Hold',
        doItemsAction: () => this.setHold(false),
        allowed: () => true,
      },
    ];
    masterListOfColumns = [
      {
        field: 'orderCode',
        headerName: "Order",
        hide: false,
        filter: 'agTextColumnFilter',
        cellRenderer: params => {
           return `<link-helper document-id="'JobDetail/${params.data.ordId}'" label="'${params.value}'" hide-type="true"></link-helper>`;
        },
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 160,
        suppressSizeToFit: true,
      },
      {
        field: 'materialCode',
        headerName: "Material",
        hide: false,
        filter: 'agTextColumnFilter',
        cellRenderer: params => {
           return `<link-helper document-id="'Material/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
        },
      },
      {
        field: 'materialDescription',
        headerName: "MaterialDescription",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'toolingCode',
        headerName: "Tooling",
        hide: false,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'toolingDescription',
        headerName: "ToolingDescription",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'totalFt',
        headerName: "Total",
        hide: false,
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
      },
      {
        field: 'remainingFt',
        headerName: "Remaining",
        hide: false,
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
        cellClassRules: {
           'error-cell': params => this.systemPreferences.showMaterialShortageAlerts && params.data.materialShortageAlert,
        },
      },
      {
        field: 'status',
        headerName: "Status",
        //cellFilter: 'orderStatus',
        hide: false,
        filter: 'agTextColumnFilter',
        valueFormatter: params => { return this.$filter('orderStatus')(params.value)},
      },
      {
        field: 'machineNumber',
        headerName: "Machine",
        hide: false,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'sequence',
        headerName: "Sequence",
        //cellFilter: 'number',
        hide: false,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'customerName',
        headerName: "Customer",
        hide: false,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'requiredDate',
        headerName: "RequiredBy",
        hide: false,
        valueFormatter: params => { return this.$filter('amsDate')(params.value)},
      },
      {
        field: 'completionDate',
        headerName: "Complete",
        hide: false,
        valueFormatter: params => { return this.$filter('amsDateTime')(params.value)},
      }, //should this show an icon if not complete (showing it is the estimate)?
      //{field: 'estimatedCompleteTime', name: 'Estimated', cellFilter: 'amsDateTime', displayName: 'estimated', headerCellFilter: 'translate'},
      {
        field: 'importDate',
        headerName: 'Imported',
        hide: false,
        valueFormatter: params => { return this.$filter('amsDate')(params.value)},
      },
      {
        field: 'salesOrder',
        headerName: "SalesOrder",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'workOrder',
        headerName: "WorkOrder",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'customerPO',
        headerName: "PurchaseOrder",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'customerNumber',
        headerName: "CustomerNumber",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'truckNumber',
        headerName: "TruckNumber",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'user1',
        headerName: "OrderUser1",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'user2',
        headerName: "OrderUser2",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'user3',
        headerName: "OrderUser3",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'user4',
        headerName: "OrderUser4",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'user5',
        headerName: "OrderUser5",
        hide: true,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'longestLengthIn',
        headerName: "LongestPart",
        hide: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 0)},
      },
      {
        field: 'shortestLengthIn',
        headerName: "ShortestPart",
        hide: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 0)},
      },
      {
        field: 'bundleCount',
        headerName: "BundleCount",
        hide: true,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'hasAlerts',
        headerName: "Alerts",
        hide: false,
        cellRenderer: params => {
          return (params.data.patternNotDefined ? `<md-icon md-font-icon="mdi-stamper" class="mdi mdi-18px grid-icon"><md-tooltip>Punch pattern not defined</md-tooltip></md-icon>` : '') +
                 ((params.data.materialShortageAlert && this.systemPreferences.showMaterialShortageAlerts) ?
                     `<md-icon md-font-icon="mdi-clipboard-check-outline" class="mdi mdi-18px grid-icon"><md-tooltip>Material Shortage</md-tooltip></md-icon>` : '') +
                 (params.data.hold ? `<md-icon md-font-icon="mdi-pause-circle-outline" class="mdi mdi-18px grid-icon"><md-tooltip>On Hold</md-tooltip></md-icon>` : '');
        },
        cellClassRules: {
          'error-cell': params => params.value > 1, // hold is not a red background worthy alert
       },
       width: 80,
       minWidth: 80,
       suppressSizeToFit: true,
      },
    ];
    orderStorageColumns = [];

    columns;
    searchData = {};
    searchObject;
    searchFields;
    mainJobs: IJobSummaryDto[] = [];
    systemPreferences: ISystemPreferences;

    currentWidth = 0;
    currentId = '';
    desIndex = 0;
    movingIndex = 0;
    dragingType = 'sizing';

    constructor(
      $scope: angular.IScope,
      $mdMedia,
      clientDataStore: ClientDataStore,
      $location: ng.ILocationService,
      private $filter,
      private apiResolver: IApiResolverService,
      private $mdDialog,
      private $http: angular.IHttpService,
      private $mdToast,
    ) {
      this.searchObject = $location.search();
      if (this.searchObject) {
        this.searchParams = this.searchObject;
      }
      
      let lsDaysAgo = localStorage.getItem('orders-list.daysAgo');
      if(!!lsDaysAgo) {
        this.daysAgo = +lsDaysAgo;
      }


      const localOrderColumns = localStorage.getItem('orders-list.columns');
      if(!!localOrderColumns) {
         this.orderStorageColumns = JSON.parse(localOrderColumns);
         this.columns = this.orderStorageColumns.map((col) => {
            const foundCol = this.masterListOfColumns.find(item => item.field === col.field);
            if(col.width) {
               return {
                  ...foundCol,
                  ...col,
                  suppressSizeToFit: true,
               };
            }

            if(col.field === 'orderCode') return { ...foundCol, ...col };
            return { ...foundCol, ...col, suppressSizeToFit: false, };
         })
      } else {
         this.columns = [...this.masterListOfColumns];
      }

      clientDataStore
        .Selector(state => state.SystemPreferences)
        .subscribe(prefs => {
          this.systemPreferences = prefs;
        });

      this.agGridOptions = {
        angularCompileRows: true,
        headerHeight: 25,
        defaultColDef: {
          sortable: true,
          resizable: true,
         //  headerValueGetter: params => {return this.$filter('translate')(params.colDef.headerName)},
          tooltipValueGetter: params => {
            if (typeof params.value === 'string') {
              return params.value;
            }
            return;
          }
        },
        columnDefs: this.columns,
        getRowNodeId: (data) => data.id,
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true,
        onSelectionChanged: this.onSelectionChanged,
        onColumnResized: this.onColumnResized,
        onColumnMoved: this.onColumnMoved,
        onDragStopped: this.onDragStopped,
        onSortChanged: this.onSortChanged,
        enableCellChangeFlash: true,
     };

      this.apiResolver
        .resolve('user.settings.ordersColumns@get')
        .then((userColumns: IUserColumnChoice[]) => {
          // overwrite each column's isChecked with the user's preference
          console.log('userColumns', userColumns)
          this.columns = this.columns.map(masterCol => {
            const newCols = userColumns.find(x => x.field === masterCol.field);
            return {
              ...masterCol,
              ...newCols,
              width: masterCol.width,
              hide: masterCol.hide // we need to remove, when to save `hide` on sever.
            }
          });
          if (this.agGridOptions.api){
            this.agGridOptions.api.setColumnDefs(this.columns);
            this.agGridOptions.api.sizeColumnsToFit();
          }
        });
      //// Data Subscriptions
      this.ordersSub_ = this.daysAgoObs.switchMap((e) => {
        localStorage.setItem('orders-list.daysAgo', e.daysAgo.toString());
        return clientDataStore.SelectJobSummariesAllRecent(e.daysAgo)
      })
        .debounce(500)
        .map(jobs => jobs as unknown as IJobSummaryDto[])
        .subscribe(jobs => {
          this.mainJobs = jobs//.filter(j => !j.isDeleted)
            .map(j => ({...j,
              hasAlerts: (j.patternNotDefined ? 2 : 0)
                 + (j.materialShortageAlert && this.systemPreferences.showMaterialShortageAlerts ? 2 : 0)
                 + (j.hold ? 1 : 0)
            }));
          this.onEditPrintContent();

          if (this.agGridOptions.api) {
            let n = [];
            let u = [];
            let d = [];
            let newKnown: string[] = [];
            this.mainJobs.forEach(job => {
              if (job.isDeleted){
                d.push(job);
              } else {
                newKnown.push(job.id);
                if (this.knownJobIds.indexOf(job.id) >= 0){
                  u.push(job);
                } else {
                  n.push(job);
                }
              }
            });
            this.knownJobIds = newKnown;
            this.agGridOptions.api.applyTransaction({
              add: n,
              update: u,
              remove: d});

            // this.agGridOptions.api.sizeColumnsToFit();
          }
        });

      $scope.$on('$destroy', () => {
        this.ordersSub_.dispose();
        let mainComp = document.getElementById('print-body');
        mainComp.innerHTML = '';
      });
    }

    onSelectionChanged = () => {
      this.selectedOrdIds = this.agGridOptions.api
        .getSelectedRows()
        .map(o => o.ordId);
    }

    onColumnResized = (event) => {
      if(event.column) {
         this.currentWidth = event.column.actualWidth;
         this.currentId = event.column.colId;
         this.dragingType = 'sizing';
      }
    }

    onDragStopped = (event) => {
      let localColumns = [];
      if(this.dragingType === 'sizing') {
         this.columns = this.columns.map(col => {
            let width = undefined;
            let isWidth = false;
            if (col.field === this.currentId) {
               width = this.currentWidth;
               isWidth = true;
            } else if(col.width) {
               width = col.width;
               isWidth = true;
            }
            const newItem = {
               field: col.field,
               hide: col.hide,
               sort: col.sort,
               width
            };
            localColumns.push(newItem);
            return {...col, width, suppressSizeToFit: isWidth};
         });
      } else if (this.dragingType === 'moving'){
         this.movingIndex = this.columns.findIndex(item => item.field === this.currentId);
         const movedItem = this.columns[this.movingIndex];
         if(this.desIndex > this.movingIndex) {
            this.columns.splice(this.desIndex+1, 0, movedItem);
            this.columns.splice(this.movingIndex, 1);
         } else {
            this.columns.splice(this.desIndex, 0, movedItem);
            this.columns.splice(this.movingIndex + 1, 1);
         }
         localColumns = this.columns.map(item => ({field: item.field, width: item.width, hide: item.hide, sort: item.sort}));
      }
      // this.agGridOptions.api.setColumnDefs(this.columns);
      localStorage.setItem('orders-list.columns', JSON.stringify(localColumns));
    }

    onReset() {
      localStorage.removeItem('orders-list.columns');
      this.columns = [...this.masterListOfColumns];
      this.agGridOptions.api.setColumnDefs(this.columns);
      this.agGridOptions.api.sizeColumnsToFit();
    }

    onColumnMoved = (event) => {
      if(event.column) {
         this.dragingType = 'moving';
         this.desIndex = event.toIndex;
         this.currentId = event.column.colId;
      }
    }

    onSortChanged = (event) => {
      let localColumns = [];
      const sortColumns = this.agGridOptions.api.getSortModel();
      if (sortColumns.length > 0) {
         this.columns = this.columns.map(col => {
            let sortDirection = '';
            if(col.field === sortColumns[0].colId) {
               sortDirection = sortColumns[0].sort;
            }
            const newItem = {
               field: col.field,
               hide: col.hide,
               sort: sortDirection,
               width: col.width
            };
            localColumns.push(newItem);
            return {...col, sort: sortDirection};
         });
         localStorage.setItem('orders-list.columns', JSON.stringify(localColumns));
      }
    }

    bulkEditField = () => {
      this.$mdDialog
        .show({
          ...BulkEditDialog,
          locals: {
            ordIds: this.selectedOrdIds,
          },
        })
        .then(result => {
          gtag('event', 'orderList_bulkEdit', {
            event_category: 'orderList',
            event_label: 'Count',
            value: this.selectedOrdIds.length,
          });
        });
    };

    bulkDelete = () => {
      this.$mdDialog
        .show({
          ...BulkDeleteDialog,
          locals: {
            ordIds: this.selectedOrdIds,
          },
        })
        .then(result => {
          gtag('event', 'orderList_bulkDelete', {
            event_category: 'orderList',
            event_label: 'Count',
            value: this.selectedOrdIds.length,
          });
        });
    };

    setHold = (onHold: boolean) => {
      this.$http({
         url: `${Ams.Config.BASE_URL}/api/orders/sethold`,
         method: "POST",
         params: { ordIds: this.selectedOrdIds, hold: onHold },
      })
      .then((result) => {
          this.$mdDialog.hide(result.data);
          gtag("event", "orderList_bulkHold", {
            event_category: "orderList",
            event_label: "bulkHold",
            value: this.selectedOrdIds.length,
          });
      })
      .catch((result) => {
        console.error(result);
        this.toast(
            "Hold change was not saved. " + result.data.errors.join(" ")
        );
      });
    };

    onOrdersGridOptionsToggle = column => {
      column.hide = !column.hide;

      if (this.agGridOptions.api){
        this.agGridOptions.api.setColumnDefs(this.columns);
        this.agGridOptions.api.sizeColumnsToFit();
      }

      const data = this.columns.map(x => ({
        field: x.field,
        isChecked: !x.hide,
        width: x.width
      }));
      const localColumns = this.columns.map(item => ({field: item.field, width: item.width, hide: item.hide}));
      localStorage.setItem('orders-list.columns', JSON.stringify(localColumns));
      this.apiResolver.resolve('user.settings.ordersColumns@post', data);

      // todo: this is not being used yet. it's currently just an example.
      this.apiResolver.resolve(
        'user.settings.preferences@post',
        {key: 'orders-list.columns', value: JSON.stringify(data)}
      );
    };

    onFilter = () => {
      //console.log(searchText);
      this.agGridOptions.api.setQuickFilter(this.searchTxt);
    }

    onAddPrintHeader(mainComp) {
      const htmlStr = `
        <div id="main-print-body">
          <div id="print-content" class="print-content size-1117 pt-printer">
            <div class="page-content">
              <div class="print-content__main-titles">
                <div class="print-content__title1">Eclipsepro</div>
                <div class="print-content__title2">Orders</div>
              </div>
              <div class="print-content__main-table">
                ${mainComp}
              </div>
            </div>
          </div>
        </div>
      `;

      return htmlStr;
    }

    // todo: get the list of rows from the grid instead
    onPrintFilter(items) {
      this.searchFields = this.columns.filter(x => !x.hide).map(x => x.field);
      if (!Object.keys(this.searchData).length) return items;
      Object.keys(this.searchData).forEach(key => this.searchData[key] === undefined && delete this.searchData[key]);
      const filteredItems = items.filter((row) => {
        let match = true;
        angular.forEach(this.searchData, (value: string, key) => {
          switch (key) {
            case 'totalFt':
            case 'remainingFt': {
              if (!(row[key].toString().toLowerCase() + ' ft').match(value.toLowerCase())) {
                match = false;
              }
              break;
            }
            case 'machineNumber': {
              if (row[key]?.toString().toLowerCase() !== value.toLowerCase()) {
                match = false;
              }
              break;
            }
            case 'estimatedCompleteTime': {
              if (!this.$filter('amsDateTime')(row[key]).match(value)) {
                match = false;
              }
              break;
            }
            case 'requiredDate':
            case 'completeDate':
            case 'importDate': {
              if (!this.$filter('amsDate')(row[key]).match(value)) {
                match = false;
              }
              break;
            }
            case 'query': {
              let count = 0;
              match = false;
              this.searchFields.forEach((field) => {
                switch (field) {
                  case 'totalFt':
                  case 'remainingFt': {
                    if ((row[field].toString().toLowerCase() + ' ft').match(value.toLowerCase())) {
                      count++;
                    }
                    break;
                  }
                  case 'machineNumber': {
                    if (row[field]?.toString().toLowerCase() === value.toLowerCase()) {
                      count++;
                    }
                    break;
                  }
                  case 'estimatedCompleteTime': {
                    if (this.$filter('amsDateTime')(row[field]).match(value)) {
                      count++;
                    }
                    break;
                  }
                  case 'requiredDate':
                  case 'completeDate':
                  case 'importDate': {
                    if (this.$filter('amsDate')(row[field]).match(value)) {
                      count++;
                    }
                    break;
                  }
                  default: {
                    if (
                      row[field]
                        .toString()
                        .toLowerCase()
                        .match(value.toLowerCase())
                    ) {
                      count++;
                    }
                    break;
                  }
                }
              });
              if (count > 0) {
                match = true;
              }
              break;
            }
            default: {
              if (!row[key]
                .toString()
                .toLowerCase()
                .match(value.toLowerCase())
              ) {
                match = false;
              }
              break;
            }
          }
        });
        return match;
      });
      return filteredItems;
    };

    onGetMainData() {
      return this.onPrintFilter(this.mainJobs.filter(j => !j.isDeleted));
    }

    onGetMainCol(val, field) {
      switch (field) {
        case 'totalFt':
        case 'remainingFt': {
          return `<div class="main-con">${this.$filter('unitsFormat')(val, "ft", 0)}</div>`;
        }
        case 'shortestLengthIn':
        case 'longestLengthIn': {
          return `<div class="main-con">${this.$filter('unitsFormat')(val, "in", 0)}</div>`;
        }
        case 'requiredDate':
        case 'importDate': {
          return `<div class="main-con">${this.$filter('amsDate')(val, "ft", 0)}</div>`;
        }
        case 'completionDate': {
          return `<div class="main-con">${this.$filter('amsDateTime')(val, "ft", 0)}</div>`;
        }
        default: {
          return `<div class="main-con">${val}</div>`;
        }
      }

    }

    onGetRowForPrint(item) {
      this.searchFields = this.columns.filter(x => !x.hide).map(x => x.field);
      let row = `<div class="material-usage-item">`;
      this.searchFields.forEach(field => {
        if (item[field]) {
          row += this.onGetMainCol(item[field], field);
        } else {
          row += `<div class="main-con"></div>`;
        }
      });
      row += '</div>';
      return row;
    }
    onGetMainPage() {
      let htmlStr = `<div class="xl-list-container wi-100">
                      <div class="material-usage-item sub-header">
                    `;
      this.searchFields = this.columns.filter(x => !x.hide).map(x => x.headerName);
      this.searchFields.forEach(item => {
        let x = this.$filter('translate')(item);
        htmlStr += `<div class="main-con">${x}</div>`;
      });
      htmlStr += '</div>';
      const filteredJobs = this.onGetMainData();
      filteredJobs.forEach(item => {
        htmlStr += this.onGetRowForPrint(item);
      });

      htmlStr += '</div>';
      return htmlStr;
    }

    onEditPrintContent() {
      let mainComp = document.getElementById('print-body');
      mainComp.innerHTML = ''
      let style = document.createElement('style');
      style.innerHTML = '@page {size: 11in 17in;}';
      document.head.appendChild(style);
      const mainStr = this.onGetMainPage();
      const htmlStr = this.onAddPrintHeader(mainStr);
      mainComp.insertAdjacentHTML('beforeend', htmlStr);
    }

    openPrintPreview = () => {
      window.print();
    };

    private toast(textContent: string) {
       this.$mdToast.show(
          this.$mdToast
             .simple()
             .textContent(textContent)
             .position("top right")
             .hideDelay(2000)
             .parent("#content")
       );
    }
  }]
};

export default OrderList;
