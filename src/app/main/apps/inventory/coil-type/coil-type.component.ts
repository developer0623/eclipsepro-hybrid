import angular from 'angular';
import { ClientDataStore } from "../../../../core/services/clientData.store";
import CoilTypeTemplate from './coil-type.html';
import { GridOptions } from 'ag-grid-community';
import CoilTypeDialogTemplate from './dialogs/details-dialog.html';

const CoilType = {
  selector: 'coilType',
  template: CoilTypeTemplate,
  bindings: {},

  /** @ngInject */
  controller: ['$scope', '$mdDialog', '$filter', 'clientDataStore', '$stateParams', 'api', class CoilTypeComponent {
    // Data
    materialCode: string;
    coilType = {};
    coilList = [];
    knownCoilIds: string[] = [];
    agCoilGridOptions: GridOptions;
    masterListofColumns = [
      {
        field: 'coilId',
        headerName: 'coilId',
        filter: 'agTextColumnFilter',
        isChecked: true,
        cellRenderer: params => {
           return `<link-helper document-id="'Coil/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
        },
      },
      {
        field: 'description',
        headerName: 'description',
        filter: 'agTextColumnFilter',
        isChecked: true,
      },
      {
        field: 'lengthRemainingFt',
        headerName: 'remaining',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        isChecked: true,
      },
      {
        field: 'lengthUsedFt',
        headerName: 'used',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        isChecked: true,
      },
      {
        field: 'lengthStartFt',
        headerName: 'startLength',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        isChecked: true,
      },
      {
        field: 'lengthNonExemptScrapFt',
        headerName: 'scrap',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        isChecked: true,
      },
      {
        field: 'lengthOtherAdjustmentsFt',
        headerName: 'adjustments',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        isChecked: false,
      },
      {
        field: 'dateIn',
        //cellFilter: 'age:row.entity.dateOut',
        headerName: 'dateIn',
        filter: 'agDateColumnFilter',
        valueFormatter: params => { return this.$filter('amsDate')(params.value)},
        isChecked: true,
      },
      {
        field: 'location.name',
        headerName: 'location',
        filter: 'agTextColumnFilter',
        isChecked: true,
      },
      {
        field: 'vendorName',
        headerName: 'vendor',
        filter: 'agTextColumnFilter',
        isChecked: false,
      },
      {
        field: 'isComplete',
        headerName: 'complete',
        //filter: 'agTextColumnFilter',
        isChecked: true,
        cellRenderer: params => {
           return `<input type="checkbox" ng-checked="${params.value}"></input>`;
        },
      },
      {
        field: 'isStarted',
        headerName: 'started',
        //filter: 'agTextColumnFilter',
        isChecked: true,
        cellRenderer: params => {
           return `<input type="checkbox" ng-checked="${params.value}"></input>`;
        },
      },
    ];
    columns = this.masterListofColumns;

        //         {
        //             field: 'lengthNonExemptScrapFt + lengthExemptScrapFt',
        //             cellFilter: 'unitsFormat:"ft":0',
        //             displayName: 'scrap',
        //             headerCellFilter: 'translate',
        //         },

    // prodGridOptions = {
    //   enablesorting: true,
    //   columnDefs: [
    //       {
    //           field: 'productionDate',
    //           cellFilter: 'date',
    //           displayName: 'productionDate',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'goodPieceCount',
    //           displayName: 'totalPieces',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'goodFeet',
    //           cellFilter: 'unitsFormat:"ft":0',
    //           displayName: 'good',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'scrapFeet',
    //           cellFilter: 'unitsFormat:"ft":0',
    //           displayName: 'scrap',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'scrapPct',
    //           cellFilter: 'unitsFormat:"%":0',
    //           displayName: 'scrapPercent',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'runMinutes',
    //           cellFilter: 'unitsFormat:"min":0',
    //           displayName: 'running',
    //           headerCellFilter: 'translate',
    //       },
    //       //{field: 'nonExemptMinutes', cellFilter: 'unitsFormat:"min":0', displayName: 'unscheduled', headerCellFilter: 'translate'},
    //       {
    //           field: 'machineNumber',
    //           name: 'machine',
    //           displayName: 'machine',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'orderCode',
    //           name: 'Order',
    //           displayName: 'order',
    //           headerCellFilter: 'translate',
    //           cellTemplate: `<a ui-sref='app.orders.detail({id: row.entity.ordId})'>{{COL_FIELD}}</a>`,
    //       },
    //       {
    //           field: 'toolingCode',
    //           name: 'Tooling',
    //           displayName: 'tooling',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'coilSerialNumber',
    //           cellTemplate:
    //               '<div><a class="td-link ml-5" ui-sref="app.inventory.coils.coil({id: COL_FIELD})">{{COL_FIELD}}</a></div>',
    //           displayName: 'coilId',
    //           headerCellFilter: 'translate',
    //       },
    //       {
    //           field: 'customerName',
    //           name: 'Customer',
    //           displayName: 'customer',
    //           headerCellFilter: 'translate',
    //       },
    //   ],
    //   data: []
    // };

        coilTypeSub_;
        coilsSub_;
        //consumptionSummarySub_;

        constructor(
            $scope: angular.IScope,
            private $mdDialog,
            private $filter,
            clientDataStore: ClientDataStore,
            $stateParams,
            private api
        ) {
            this.materialCode = $stateParams.id;
            const localSortitem = localStorage.getItem('material.coils.columnsSort');
            if(!!localSortitem) {
               const sortItem = JSON.parse(localSortitem);
               this.columns = this.masterListofColumns.map(col => {
                  if(col.field === sortItem.field) {
                     return { ...col, sort: sortItem.direction}
                  }
                  return col;
               })
            } else {
               this.columns = [...this.masterListofColumns];
            }

          this.agCoilGridOptions = {
            angularCompileRows: true,
            headerHeight: 25,
            defaultColDef: {
              sortable: true,
              //resizable: true,
              headerValueGetter: params => {return this.$filter('translate')(params.colDef.headerName)},
              tooltipValueGetter: params => {
                if (typeof params.value === 'string') {
                  return params.value;
                }
                return;
              },
            },
            columnDefs: this.columns.map(({isChecked, ...rest}) => {return {...rest, hide: !isChecked}}),
            getRowNodeId: (data) => data.id,
            //onColumnResized: this.onColumnResized,
            enableCellChangeFlash: true,
            onSortChanged: this.onSortChanged,
         };
            //// Data Subscriptions
            this.coilTypeSub_ = clientDataStore
                .SelectCoilTypes()
                .flatMap(cts => cts.filter(ct => ct.materialCode === $stateParams.id))
                .subscribe(coilType => {
                    this.coilType = coilType;
                });

            this.coilsSub_ = clientDataStore
              .SelectCoilDtosIn({ property: 'MaterialCode', values: [$stateParams.id] })
              .subscribe(coils => {
                  //this.coilsGridOptions.data = coils;if (this.agGridOptions.api) {
                let n = [];
                let u = [];
                let d = [];
                let newKnown: string[] = [];
                if (this.agCoilGridOptions.api) {
                  coils.forEach(coil => {
                    // if (job.isDeleted){
                    //   d.push(job);
                    // } else {
                    newKnown.push(coil.coilId);
                    if (this.knownCoilIds.indexOf(coil.coilId) >= 0){
                      u.push(coil);
                    } else {
                      n.push(coil);
                    }
                    //}
                  });
                  this.knownCoilIds = newKnown;
                  this.agCoilGridOptions.api.applyTransaction({
                    add: n,
                    update: u,
                    remove: d});

                  this.agCoilGridOptions.api.sizeColumnsToFit();
                }
              }
            );

            // this.consumptionSummarySub_ = clientDataStore
            //     .SelectConsumptionHistoryIn({
            //         property: 'materialCode',
            //         values: [$stateParams.id],
            //     })
            //     .subscribe(history => {
            //         this.prodGridOptions.data = history;
            //     });

            $scope.$on('$destroy', () => {
                this.coilTypeSub_.dispose();
                this.coilsSub_.dispose();
                //this.consumptionSummarySub_.dispose();
            });
        }

         onSortChanged = (event) => {
            const sortColumns = this.agCoilGridOptions.api.getSortModel();
            if (sortColumns.length > 0) {
               const sortItem = {
                  field: sortColumns[0].colId,
                  direction: sortColumns[0].sort
               }
               localStorage.setItem('material.coils.columnsSort', JSON.stringify(sortItem));
            }
         }

         /*
         * Edit details dialog
         */
         editDialog(ev) {
               this.$mdDialog.show({
                  controller: ['$scope', '$mdDialog', 'coilType', ($scope, $mdDialog, coilType) => {
                     $scope.coilType = coilType;
                     $scope.hide = () => {
                           $mdDialog.hide();
                     };
                     $scope.cancel = () => {
                           $mdDialog.cancel();
                     };
                     $scope.save = () => {
                           this.api.inventory.coilTypes.coilType.update(
                              { id: $scope.coilType.id },
                              $scope.coilType,
                              function (response) {
                                 return response.data;
                              },
                              function (error) {
                                 console.log(error);
                              }
                           );
                           $mdDialog.hide();
                     };
                  }],
                  template: CoilTypeDialogTemplate,
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  locals: {
                     coilType: this.coilType,
                  },
                  clickOutsideToClose: true,
               });
         }
    }]
};

export default CoilType;
