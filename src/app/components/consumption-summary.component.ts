import * as angular from "angular";
import * as _ from "lodash";
import { Ams } from "../amsconfig";
//import { IProductionEvent } from "../core/dto";
import { GridOptions, ColDef } from 'ag-grid-community';
import { ClientDataStore } from '../core/services/clientData.store';

const ConsumptionSummary = {
   selector: "consumptionSummary",
   template: `<div ag-grid="$ctrl.agGridOptions" class="ag-theme-balham full-page-grid"></div>`,
   bindings: {
   ordId: "<",
   machine: "<",
   coil: "<",
   material: "<",
   // startDate: "<",
   // endDate: "<",
   },
   controller: ['$http', '$scope', '$filter', 'clientDataStore', '$timeout', class ConsumptionSummaryComponent {
      ordId: string;
      machine: number;
      coil: string;
      material: string;
      //startDate: Date;
      //endDate: Date;
      displayGroup: string = "";
      consumptionSummarySub_;
      agGridOptions: GridOptions;
      columnList: ColDef[] = [
               {
                  headerName: "id",
                  field: "id",
                  hide: true
               },
               {
                  headerName: "date",
                  field: "productionDate",
                  type: "dateColumn",
                  valueFormatter: params => { return this.$filter('amsDate')(params.value)},
               },
               {
                  headerName: "machine",
                  field: "machineNumber", //todo: create filter or component
                  filter: 'agTextColumnFilter',
                  //displayGroup: 'machine'
               },
               {
                  headerName: "order",
                  field: "orderCode",
                  filter: 'agTextColumnFilter',
                  cellRenderer: params => {
                     return `<link-helper document-id="'JobDetail/${params.data.ordId}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
               },
               {
                  headerName: "material",
                  field: "materialCode",
                  cellRenderer: params => {
                     return `<link-helper document-id="'Material/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
                  filter: 'agTextColumnFilter',
               },
               {
                  headerName: "tooling",
                  field: "toolingCode",
                  filter: 'agTextColumnFilter',
               },
               {
                  headerName: "coil",
                  field: "coilSerialNumber",
                  filter: 'agTextColumnFilter',
                  cellRenderer: params => {
                     return `<link-helper document-id="'Coil/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
                  //displayGroup: "coil",
               },
               {
                  headerName: "Coil Material",
                  field: "coilMaterialCode",
                  cellRenderer: params => {
                     return `<link-helper document-id="'Material/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
                  },
                  filter: 'agTextColumnFilter',
                  cellClassRules: {
                     'grid-cell-alert-frame': params => params.value && params.value !== params.data.materialCode,
                  },
                  hide: true
               },
               {
                  headerName: "good",
                  field: "goodPieceCount",
                  filter: 'agNumberColumnFilter',
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "scrap",
                  field: "scrapPieceCount",
                  filter: 'agNumberColumnFilter',
                  hide: true
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "totalLength",
                  field: "totalFeet",
                  filter: 'agNumberColumnFilter',
                  valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
                  hide: true
               },
               {
                  headerName: "goodLength",
                  field: "goodFeet",
                  filter: 'agNumberColumnFilter',
                  valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "scrapLength",
                  field: "scrapFeet",
                  filter: 'agNumberColumnFilter',
                  valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "reclaimedScrapLength",
                  field: "reclaimedScrapFeet",
                  filter: 'agNumberColumnFilter',
                  valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 2)},
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "Duration",
                  field: "totalMinutes",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  //footerCellFilter: "number:2",
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
                  hide: true
               },
               {
                  headerName: "operationMinutes",
                  field: "operationMinutes",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  //footerCellFilter: "number:2",
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
                  hide: true
               },
               {
                  headerName: "runMinutes",
                  field: "runMinutes",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  //footerCellFilter: "number:2",
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
               },
               {
                  headerName: "nonExemptMinutes",
                  field: "nonExemptMinutes",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  //footerCellFilter: "number:2",
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
                  hide: true
               },
               {
                  headerName: "exemptMinutes",
                  field: "exemptMinutes",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  //footerCellFilter: "number:2",
                  //aggregationType: this.uiGridConstants.aggregationTypes.sum,
                  hide: true
               },
               //fpm
               {
                  headerName: "avgFpm",
                  field: "avgFpm",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  hide: true
               },
               {
                  headerName: "targetFpm",
                  field: "targetFpm",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  hide: true
               },
               {
                  headerName: "ScrapPct",
                  field: "scrapPct",
                  filter: 'agNumberColumnFilter',
                  //cellFilter: "number:2",
                  hide: true
               },
            ]

      columType = '';


      /** @ngInject */
      constructor(
         private $http: angular.IHttpService,
         private $scope,
         private $filter,
         private clientDataStore: ClientDataStore,
         $timeout
      ) {
         this.displayGroup = this.ordId
            ? "order"
            : this.coil
            ? "coil"
            : this.material
            ? "material"
            : "all";
         this.columType = `${this.displayGroup}ConsumptionSummaryColumns`;

         const localSortitem = localStorage.getItem(this.columType);
         let sortedColumns = [];
         if(!!localSortitem) {
            const sortItem = JSON.parse(localSortitem);
            sortedColumns = this.columnList.map(col => {
               if(col.field === sortItem.field) {
                  return { ...col, sort: sortItem.direction}
               }
               return col;
            })
         } else {
            sortedColumns = [...this.columnList];
         }

         this.agGridOptions = {

            headerHeight: 25,
            columnDefs: sortedColumns,
            onSortChanged: this.onSortChanged,
            defaultColDef: {
               sortable: true,
            }
            // .filter(
            //    (c) => c.displayGroup !== this.displayGroup
            // ),
         };


         //this.refreshData();

         // Load saved column state
         // $timeout(() => {
         //    const stateString = localStorage.getItem(
         //       `productionLog-Grid-${$scope.$ctrl.displayGroup}`
         //    );
         //    if (stateString) {
         //       let savedState = JSON.parse(stateString);
         //       let currentState = $scope.gridApi.saveState.save();
         //       currentState.columns = savedState.columns;
         //       $scope.gridApi.saveState.restore($scope, currentState);
         //    }
         // });
         //}

         $scope.$on('$destroy', () => {
            this.consumptionSummarySub_.dispose();
         });
      }

      private refreshData() {

         let query;
         if (this.ordId) {
          query = { property: 'ordId', values: [this.ordId] };
         } else
         if (this.machine) {
          query = { property: 'machineNumber', values: [this.machine] };
         } else
         if (this.coil) {
          query = { property: 'coilSerialNumber', values: [this.coil] };
         } else
         if (this.material) {
          query = { property: 'materialCode', values: [this.material] };
         }
         //if (this.startDate) query = { ...query, startDate: this.startDate };
         //if (this.endDate) query = { ...query, endDate: this.endDate };

         if (_.isEmpty(query)) {
          // can't load unbounded results
          return;
       }

         this.consumptionSummarySub_ = this.clientDataStore
         .SelectConsumptionHistoryIn(query)
         .subscribe(history => {
            if (this.agGridOptions.api) {
               this.agGridOptions.api.setRowData(history);
               this.agGridOptions.api.sizeColumnsToFit();
            }
         });

      }

      onSortChanged = (event) => {
         const sortColumns = this.agGridOptions.columnApi.getColumnState().filter(s => s.sort !== null);
         if (sortColumns.length > 0) {
            const sortItem = {
               field: sortColumns[0].colId,
               direction: sortColumns[0].sort
            }
            localStorage.setItem(this.columType, JSON.stringify(sortItem));
         }
       }

      $onChanges() {
         this.refreshData();
      }

   }],
};

export default ConsumptionSummary;
