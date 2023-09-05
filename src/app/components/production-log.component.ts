import * as angular from "angular";
import * as _ from "lodash";
import { Ams } from "../amsconfig";
import { IProductionEvent } from "../core/dto";
import { GridOptions } from 'ag-grid-community';

const ProductionLog = {
   selector: "productionLog",
   template: `
      <div class="production-log-menu-container">
         <md-menu>
            <md-button aria-label="Select Shift 1" class="md-icon-button" ng-click="$mdMenu.open($event)">
               <!-- <div class="helpIconDiv" ng-click="$mdMenu.open($event)"> -->
               <md-icon md-font-icon="icon-cog" class="icon"></md-icon>
               <!-- </div> -->
            </md-button>
            <md-menu-content width="2" class="ordersFilterDiv">
               <div layout="row" class="addColumn" layout-align="center center">
                     Add/Remove Column
               </div>
               <div class="vertical-scroll">
                     <md-menu-item ng-repeat="item in $ctrl.columns" class="filter-item height-26">
                        <div layout="row" class="filter-items-div">
                           <md-checkbox name="{{item.headerName}}" aria-label="{{item.headerName}}"
                                 ng-checked="!item.hide" class="filter-check"
                                 ng-click="$ctrl.onOrdersGridOptionsToggle(item)"><span
                                    translate="{{item.headerName}}"></span></md-checkbox>
                        </div>
                     </md-menu-item>
                     <md-menu-divider></md-menu-divider>
                     <md-menu-item class="filter-items">
                     <div layout="row" class="filter-items-div">
                        <md-button class="md-raised md-primary" ng-click="$ctrl.onReset()">Reset Defaults
                        </md-button>
                     </div>
                     </md-menu-item>
               </div>
            </md-menu-content>
         </md-menu>
      </div>
      <div ag-grid="$ctrl.agGridOptions" class="ag-theme-balham full-page-grid"></div>
      `,
   bindings: {
      ordId: "<",
      machines: "<",
      shiftCode: "<",
      coil: "<",
      patternName: "<",
      startDate: "<",
      endDate: "<",
      shifts: "<",
   },
   controller: ['$http', '$scope', '$filter', '$timeout', class ProductionLogComponent {
      ordId: string;
      machines: number | number[];
      shiftCode: string;
      coil: string;
      patternName: string;
      startDate: Date;
      endDate: Date;
      shifts: number[];
      group = '';
      displayGroup: string = "";
      agGridOptions: GridOptions;
      masterListOfColumns = [
               {
                  headerName: "title",
                  field: "eventTitle",
                  filter: 'agTextColumnFilter',
                  minWidth: 100,
                  hide: false,
               },
               {
                  headerName: "date",
                  field: "recordDate",
                  type: "dateColumn",
                  valueFormatter: params => { return this.$filter('amsDate')(params.value)},
                  minWidth: 90,
                  hide: false,
               },
               {
                  headerName: "time",
                  field: "recordDate",
                  //type: "timeColumn",
                  valueFormatter: params => { return this.$filter('amsTime')(params.value)},
                  minWidth: 90,
                  hide: false,
               },
               {
                  headerName: "machine",
                  field: "machineDescription",
                  filter: 'agTextColumnFilter',
                  displayGroup: 'machine',
                  hide: false,
               },
               {
               // if the row is of type 'log', we replace Order and the rest with the message
                  headerName: "order",
                  field: "orderCode",
                  filter: 'agTextColumnFilter',
                  hide: false,
                  cellRenderer: params => {
                     if (params.data.eventTitle === 'log') {
                        return params.data.eventMessage;
                     }
                     if (params.data.eventTitle === 'error') {
                        return params.data.eventMessage;
                     }
                     return `<link-helper document-id="'JobDetail/${params.data.ordId}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
                  colSpan: params => (params.data.eventTitle === 'log' || params.data.eventTitle === 'error') ? 20 : 1,
               },
               {
                  headerName: "bundle",
                  field: "bundle",
                  filter: 'agNumberColumnFilter',
                  hide: false,
                  cellClassRules: {
                     'grid-cell-alert-text': params => params.value >= 900,
                  }
               },
               {
                  headerName: "partLength",
                  field: "partLengthIn",
                  filter: 'agNumberColumnFilter',
                  hide: false,
                  valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 3)},
               },
               {
                  headerName: "quantity",
                  field: "quantity",
                  filter: 'agNumberColumnFilter',
                  hide: false,
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "Produced",
                  field: "producedLengthFt",
                  filter: 'agNumberColumnFilter',
                  hide: false,
                  valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "Consumed",
                  field: "consumedLengthFt",
                  filter: 'agNumberColumnFilter',
                  hide: false,
                  valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
                  cellClassRules: {
                  // todo: remove kerf
                     'grid-cell-alert-text': params => params.data.scrapFt + params.data.exemptScrapFt >= 0.5,
                  },
                  // aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {

                  headerName: "coil",
                  field: "coilSerialNumber",
                  filter: 'agTextColumnFilter',
                  hide: false,
                  cellRenderer: params => {
                     return `<link-helper document-id="'Coil/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
                  displayGroup: "coil",
               },
               {
                  headerName: "Coil Material",
                  field: "coilMaterialCode",
                  hide: false,
                  cellRenderer: params => {
                     return `<link-helper document-id="'Material/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
                  filter: 'agTextColumnFilter',
                  cellClassRules: {
                     'grid-cell-alert-frame': params => params.value && params.data.materialCode && params.value !== params.data.materialCode,
                  },
               },
               {
                  headerName: "itemId",
                  field: "externalItemId",
                  filter: 'agTextColumnFilter',
                  hide: false,
               },
               {
                  headerName: "Pattern",
                  field: "patternName",
                  filter: 'agTextColumnFilter',
                  cellRenderer: params => {
                     return `<link-helper document-id="'${params.data.patternId}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
                  displayGroup: "patternName",
                  hide: false,
               },
               {
                  headerName: "Duration",
                  field: "durationMinutes",
                  filter: 'agNumberColumnFilter',
                  hide: false,
                  cellClassRules: {
                     'grid-cell-alert-text': params => params.data.downMinutes + params.data.exemptMinutes > 0,
                  },
                  //cellFilter: "number:2",
                  //footerCellFilter: "number:2",
                  // aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "Description",
                  field: "lossDescription",
                  filter: 'agTextColumnFilter',
                  hide: false,
               },
               {
                  headerName: "Work Group",
                  field: "workGroup",
                  filter: 'agTextColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Processed",
                  field: "processedDate",
                  valueFormatter: params => { return this.$filter('amsDateTime')(params.value)},
                  hide: true,
               },
               {
                  headerName: "Employee",
                  field: "employeeName",
                  filter: 'agTextColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Employee No.",
                  field: "employeeNumber",
                  filter: 'agTextColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Heat Number",
                  field: "heatNumber",
                  filter: 'agTextColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Bundle Id",
                  field: "bundleId",
                  filter: 'agTextColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Coil Change",
                  field: "coilChange",
                  filter: 'agNumberColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Material Change",
                  field: "materialChange",
                  filter: 'agNumberColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Tooling Change",
                  field: "toolingChange",
                  filter: 'agNumberColumnFilter',
                  hide: true,
               },
               {
                  headerName: "Material Deviation",
                  field: "toolingChange",
                  filter: 'agNumberColumnFilter',
                  hide: true,
               },
            ];
      columns;

      currentWidth = 0;
      currentId = '';
      desIndex = 0;
      movingIndex = 0;
      dragingType = 'sizing';
      columType = '';
      dataSub$: Rx.IDisposable;


      /** @ngInject */
      constructor(
         private $http: angular.IHttpService,
         private $scope,
         private $filter,
         $timeout
      ) { }

      private refreshData() {
         let query = {};
         if (this.ordId) query = { ...query, ordId: this.ordId };
         if (this.machines) query = { ...query, machines: this.machines };
         if (this.shiftCode) query = { ...query, shiftCode: this.shiftCode };
         if (this.coil) query = { ...query, coilSerialNumber: this.coil };
         if (this.patternName) query = { ...query, patternName: this.patternName };
         if (this.startDate) query = { ...query, startDate: this.startDate };
         if (this.endDate) query = { ...query, endDate: this.endDate };
         if (this.shifts) query = { ...query, shifts: this.shifts };

         if (_.isEmpty(query)) {
            // can't load unbounded results
            return;
         }

         // don't send a bad request if we don't have enough info
         // machine dashboard doesn't always have shiftCode property on group
         if (query["machines"] && !query["shiftCode"] && (!query["startDate"] || !query["endDate"])) {
            return;
         }

         // todo: now that we know the filter, we should update columns based on displayGroup

         this.dataSub$ = Rx.Observable.fromPromise(
            this.$http.get<IProductionEvent[]>(
               Ams.Config.BASE_URL + `/_api/productionEvents`,
               { params: query }
            )
         ).subscribe((response) => {
            this.agGridOptions.api.setRowData(response.data);
            this.agGridOptions.api.sizeColumnsToFit();
         });
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
         localStorage.setItem(this.columType, JSON.stringify(localColumns));
       }

       onReset() {
         localStorage.removeItem(this.columType);
         this.columns = [...this.masterListOfColumns.filter(
            (c) => c.displayGroup !== this.displayGroup
         )];
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
            localStorage.setItem(this.columType, JSON.stringify(localColumns));
         }
       }

       onOrdersGridOptionsToggle = column => {
         column.hide = !column.hide;

         if (this.agGridOptions.api){
           this.agGridOptions.api.setColumnDefs(this.columns);
           this.agGridOptions.api.sizeColumnsToFit();
         }

         const localColumns = this.columns.map(item => ({field: item.field, width: item.width, hide: item.hide}));
         localStorage.setItem(this.columType, JSON.stringify(localColumns));
       };

      $onChanges() {
         this.refreshData();
      }

      $onInit() {
         this.displayGroup = this.ordId
            ? "order"
            : this.shiftCode
            ? "machine"
            : this.coil
            ? "coil"
            : this.patternName
            ? "patternName"
            : "all";

         this.columType = `production-log.${this.displayGroup}.columns`;

         const localOrderColumns = localStorage.getItem(this.columType);
         if(!!localOrderColumns) {
            const orderStorageColumns = JSON.parse(localOrderColumns);
            this.columns = orderStorageColumns.map((col) => {
               const foundCol = this.masterListOfColumns.find(item => item.field === col.field);
               if(col.width) {
                  return {
                     ...foundCol,
                     ...col,
                     suppressSizeToFit: true,
                  };
               }
               return { ...foundCol, ...col, suppressSizeToFit: false, };
            })
         } else {
            this.columns = [...this.masterListOfColumns.filter(
               (c) => c.displayGroup !== this.displayGroup
            )];
         }

         this.agGridOptions = {
            angularCompileRows: true,
            headerHeight: 25,
            columnDefs: this.columns,
            defaultColDef: {
              sortable: true,
              resizable: true,
              headerValueGetter: params => {return this.$filter('translate')(params.colDef.headerName)},
              tooltipValueGetter: params => {
                if (typeof params.value === 'string') {
                  return params.value;
                }
                return;
              }
            },
            onColumnResized: this.onColumnResized,
            onColumnMoved: this.onColumnMoved,
            onDragStopped: this.onDragStopped,
            onSortChanged: this.onSortChanged,
         };
      }

      $onDestroy() {
         if (this.dataSub$) {
            this.dataSub$.dispose();
         }
      }

   }],
};

export default ProductionLog;
