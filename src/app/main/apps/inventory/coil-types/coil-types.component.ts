import angular from 'angular';
import { ClientDataStore } from "../../../../core/services/clientData.store";
import { IUserColumnChoice } from '../../../../core/dto';
import { IApiResolverService } from "../../../../reference";
import { GridOptions } from 'ag-grid-community';
import CoilTypesTemplate from './coil-types.html';

const CoilTypes = {
  selector: 'coilTypes',
  template: CoilTypesTemplate,
  bindings: {},
  /** @ngInject */
  controller: ['$scope', '$mdMedia', '$filter', 'clientDataStore', '$location', 'apiResolver', class CoilTypesComponent {
    searchTxt = '';

    knownCoilIds: string[] = [];
    agGridOptions: GridOptions;
    coilTypesSub_;

    sortedField = '';
    sortedDirection = '';

    masterListOfColumns = [
      {
        field: 'materialCode',
        headerName: 'material',
        filter: 'agTextColumnFilter',
        isChecked: true,
        cellRenderer: params => {
          return `<link-helper document-id="'Material/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
        },
      },
      {
        field: 'description',
        headerName: 'description',
        filter: 'agTextColumnFilter',
        isChecked: true,
      },
      {
        field: 'onHandFt',
        headerName: 'onHand',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 0)},
        isChecked: true,
      },
      {
        field: 'demandFt',
        headerName: 'demand',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 0)},
        isChecked: true,
      },
      {
        field: 'balanceFt',
        headerName: 'balance',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 0)},
        isChecked: true,
      },
      {
        field: 'gauge',
        headerName: 'gauge',
        filter: 'agNumberColumnFilter',
        isChecked: true,
      },
      {
        field: 'thicknessIn',
        headerName: 'thickness',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 3)},
        isChecked: true,
      },
      {
        field: 'widthIn',
        headerName: 'width',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 3)},
        isChecked: true,
      }, //
      {
        field: 'color',
        headerName: 'color',
        filter: 'agTextColumnFilter',
        isChecked: true,
      },
      {
        field: 'type',
        headerName: 'materialType',
        filter: 'agTextColumnFilter',
        isChecked: true,
      },
      //{field: 'lbsPerFt'}
    ];

    columns;
    coilTypes = [];

    currentWidth = 0;
    currentId = '';
    desIndex = 0;
    movingIndex = 0;
    dragingType = 'sizing';

    constructor(
      $scope: angular.IScope,
      $mdMedia,
      private $filter,
      clientDataStore: ClientDataStore,
      private $location: ng.ILocationService,
      private apiResolver: IApiResolverService
    ) {
      const localOrderColumns = localStorage.getItem('material-list.columns');
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
         this.columns = [...this.masterListOfColumns];
      }

      this.agGridOptions = {

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
        columnDefs: this.columns,
        getRowId: params => params.data.materialCode,
        onColumnResized: this.onColumnResized,
        onColumnMoved: this.onColumnMoved,
        onDragStopped: this.onDragStopped,
        onSortChanged: this.onSortChanged,
        enableCellChangeFlash: true,
     };

      this.apiResolver
        .resolve('user.settings.coilTypesColumns@get')
        .then((userColumns: IUserColumnChoice[]) => {
          // overwrite each column's isChecked with the user's preference
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
          //this.coilTypesGridOptions.columnDefs = mainCols;
        });

      this.coilTypesSub_ = clientDataStore.SelectCoilTypes()
        .debounce(500).subscribe(coilTypes => {
          this.coilTypes = coilTypes;
          //this.coilTypesGridOptions.data = coilTypes;
          // this.onEditPrintContent();

            if (this.agGridOptions.api) {
              let n = [];
              let u = [];
              let d = [];
              let newKnown: string[] = [];
              coilTypes.forEach(ct => {
                // if (job.isDeleted){
                //   d.push(job);
                // } else {
                newKnown.push(ct.materialCode);
                if (this.knownCoilIds.indexOf(ct.materialCode) >= 0){
                  u.push(ct);
                } else {
                  n.push(ct);
                }
                //}
              });
              this.knownCoilIds = newKnown;
              this.agGridOptions.api.applyTransaction({
                add: n,
                update: u,
                remove: d});

            //   this.agGridOptions.api.sizeColumnsToFit();
            }
      });

      $scope.$on('$destroy', () => {
        this.coilTypesSub_.dispose();
      });
    }

    onFilter = () => {
      this.agGridOptions.api.setQuickFilter(this.searchTxt);
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
      localStorage.setItem('material-list.columns', JSON.stringify(localColumns));
    }

    onReset() {
      localStorage.removeItem('material-list.columns');
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
      const sortColumns = this.agGridOptions.columnApi.getColumnState().filter(s => s.sort !== null);
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
         localStorage.setItem('material-list.columns', JSON.stringify(localColumns));
      }
    }

    onCoilTypesGridOptionsToggle = column => {
      column.hide = !column.hide;
      //this.coilsGridOptions.columnDefs = this.columns.filter(x => x.isChecked);
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
       localStorage.setItem('material-list.columns', JSON.stringify(localColumns));

      this.apiResolver.resolve(
        'user.settings.coilTypesColumns@post',
        this.columns.map(x => ({ field: x.field, isChecked: x.isChecked }))
      );
    };

    //// Filtering


    // onAddPrintHeader(mainComp) {
    //     const htmlStr = `
    //         <div id="main-print-body">
    //         <div id="print-content" class="print-content size-1117 pt-printer">
    //             <div class="page-content">
    //             <div class="print-content__main-titles">
    //                 <div class="print-content__title1">EclipsePro</div>
    //                 <div class="print-content__title2">Coil Types</div>
    //             </div>
    //             <div class="print-content__main-table">
    //                 ${mainComp}
    //             </div>
    //             </div>
    //         </div>
    //         </div>
    //     `;

    //     return htmlStr;
    // }

    // onPrintFilter(items) {
    //     this.searchFields = this.columns.filter(x => x.isChecked).map(x => x.field);
    //     if (!Object.keys(this.searchData).length) return items;
    //     Object.keys(this.searchData).forEach(key => this.searchData[key] === undefined && delete this.searchData[key]);
    //     const filteredItems = items.filter((row) => {
    //         let match = true;
    //         angular.forEach(this.searchData, (value: string, key) => {
    //             switch (key) {
    //                 case 'onHandFt':
    //                 case 'demandFt':
    //                 case 'balanceFt': {
    //                     if (!(row[key].toString().toLowerCase() + ' ft').match(value.toLowerCase())) {
    //                         match = false;
    //                     }
    //                     break;
    //                 }
    //                 case 'query': {
    //                     let count = 0;
    //                     match = false;
    //                     this.searchFields.forEach((field) => {
    //                         switch (field) {
    //                             case 'onHandFt':
    //                             case 'demandFt':
    //                             case 'balanceFt': {
    //                                 if ((row[field].toString().toLowerCase() + ' ft').match(value.toLowerCase())) {
    //                                     count++;
    //                                 }
    //                                 break;
    //                             }
    //                             default: {
    //                                 if (
    //                                     row[field]
    //                                         .toString()
    //                                         .toLowerCase()
    //                                         .match(value.toLowerCase())
    //                                 ) {
    //                                     count++;
    //                                 }
    //                                 break;
    //                             }
    //                         }
    //                     });
    //                     if (count > 0) {
    //                         match = true;
    //                     }
    //                     break;
    //                 }
    //                 default: {
    //                     if (!row[key]
    //                         .toString()
    //                         .toLowerCase()
    //                         .match(value.toLowerCase())
    //                     ) {
    //                         match = false;
    //                     }
    //                     break;
    //                 }
    //             }
    //         });
    //         return match;
    //     });
    //     return filteredItems;
    // };

    // onGetMainData() {
    //     return this.onPrintFilter(this.coilTypes);
    // }

    // onGetMainCol(val, field) {
    //     switch (field) {
    //         case 'onHandFt':
    //         case 'demandFt':
    //         case 'balanceFt': {
    //             return `<div class="main-con">${this.$filter('unitsFormat')(val, "ft", 0)}</div>`;
    //         }
    //         default: {
    //             return `<div class="main-con">${val}</div>`;
    //         }
    //     }

    // }

    // onGetRowForPrint(item) {
    //     this.searchFields = this.columns.filter(x => x.isChecked).map(x => x.field);
    //     let row = `<div class="material-usage-item">`;
    //     this.searchFields.forEach(field => {
    //         if (item[field] || item[field] === 0) {
    //             row += this.onGetMainCol(item[field], field);
    //         } else {
    //             row += `<div class="main-con"></div>`;
    //         }
    //     });
    //     row += '</div>';
    //     return row;
    // }
    // onGetMainPage() {
    //     let htmlStr = `<div class="xl-list-container wi-100">
    //                     <div class="material-usage-item sub-header">
    //                     `;
    //     this.searchFields = this.columns.filter(x => x.isChecked).map(x => x.name);
    //     this.searchFields.forEach(item => {
    //         htmlStr += `<div class="main-con">${item}</div>`;
    //     });
    //     htmlStr += '</div>';
    //     const filteredJobs = this.onGetMainData();
    //     filteredJobs.forEach(item => {
    //         htmlStr += this.onGetRowForPrint(item);
    //     });

    //     htmlStr += '</div>';
    //     return htmlStr;
    // }

    // onEditPrintContent() {
    //     let mainComp = document.getElementById('print-body');
    //     mainComp.innerHTML = ''
    //     let style = document.createElement('style');
    //     style.innerHTML = '@page {size: 11in 17in;}';
    //     document.head.appendChild(style);
    //     const mainStr = this.onGetMainPage();
    //     const htmlStr = this.onAddPrintHeader(mainStr);
    //     mainComp.insertAdjacentHTML('beforeend', htmlStr);
    // }

    // openPrintPreview = () => {
    //     window.print();
    // };


}]
};

export default CoilTypes;
