import * as angular from "angular";
import { IUserColumnChoice } from "../../../../core/dto";
import { ClientDataStore } from "../../../../core/services/clientData.store";
import { IApiResolverService } from '../../../../reference';
import { GridOptions } from 'ag-grid-community';
import CoilsTemplate from './coils.html';
const AppCoils = {
  selector: 'appCoils',
  template: CoilsTemplate,
  bindings: {},
  /** @ngInject */
  controller: ['$scope', '$mdMedia', '$filter', 'clientDataStore', '$location', 'apiResolver', class AppCoilsComponent {
    searchTxt = '';
    showCompleted = false;
    discreteFilterChanges$ = new Rx.BehaviorSubject<
      | { showCompleted: Boolean }
    >({ showCompleted: false });

    //// Grid
    knownCoilIds: string[] = [];
    agGridOptions: GridOptions;
    masterListofColumns = [
      {
        field: 'coilId',
        headerName: 'coilId',
        filter: 'agTextColumnFilter',
        hide: false,
        cellRenderer: params => {
           return `<link-helper document-id="'Coil/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
        },
      },
      {
        field: 'materialCode',
        headerName: 'material',
        filter: 'agTextColumnFilter',
        hide: false,
        cellRenderer: params => {
           return `<link-helper document-id="'Material/${params.value}'" label="'${params.value}'" hide-type="true"></link-helper>`;
        },
      },
      {
        field: 'description',
        headerName: 'description',
        filter: 'agTextColumnFilter',
        hide: false,
      },
      {
        field: 'lengthRemainingFt',
        headerName: 'remaining',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        hide: false,
      },
      {
        field: 'lengthStartFt',
        headerName: 'startLength',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        hide: false,
      },
      {
        field: 'lengthUsedFt',
        headerName: 'used',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        hide: false,
      },
      {
        field: 'lengthNonExemptScrapFt',
        headerName: 'scrap',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        hide: false,
      },
      {
        field: 'lengthOtherAdjustmentsFt',
        headerName: 'adjustments',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "ft", 1)},
        hide: true,
      },
      {
        field: 'dateIn',
        //cellFilter: 'age:row.entity.dateOut',
        headerName: 'dateIn',
        filter: 'agDateColumnFilter',
        valueFormatter: params => { return this.$filter('amsDate')(params.value)},
        hide: false,
      },
      {
        field: 'location.name',
        headerName: 'location',
        filter: 'agTextColumnFilter',
        hide: true,
      },
      {
        field: 'vendorName',
        headerName: 'vendor',
        filter: 'agTextColumnFilter',
        hide: true,
      },
      {
        field: 'isComplete',
        headerName: 'complete',
        //filter: 'agTextColumnFilter',
        hide: false,
        cellRenderer: params => {
           return `<input type="checkbox" ng-checked="${params.value}"></input>`;
        },
      },
      {
        field: 'isStarted',
        headerName: 'started',
        //filter: 'agTextColumnFilter',
        hide: false,
        cellRenderer: params => {
           return `<input type="checkbox" ng-checked="${params.value}"></input>`;
        },
      },
    ];
    columns;
    coilsSub_;
    coils = [];

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
      const localOrderColumns = localStorage.getItem('coil-list.columns');
      if(!!localOrderColumns) {
         const orderStorageColumns = JSON.parse(localOrderColumns);
         this.columns = orderStorageColumns.map((col) => {
            const foundCol = this.masterListofColumns.find(item => item.field === col.field);
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
         this.columns = [...this.masterListofColumns];
      }

      this.agGridOptions = {

        headerHeight: 25,
        defaultColDef: {
          sortable: true,
          resizable: true,
          headerValueGetter: params => {return this.$filter('translate')(params.colDef.headerName)},
          tooltipValueGetter: params => {
            if (typeof params.value === 'string') {
              return params.value;
            }
            return;
          },
        },
        columnDefs: this.columns,
        getRowId: params => params.data.id,
        onColumnResized: this.onColumnResized,
        onColumnMoved: this.onColumnMoved,
        onDragStopped: this.onDragStopped,
        onSortChanged: this.onSortChanged,
        enableCellChangeFlash: true,
     };


      this.apiResolver
        .resolve('user.settings.coilsColumns@get')
        .then((userColumns: IUserColumnChoice[]) => {
          // Overwrite each column's isChecked with the user's preference
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

      this.coilsSub_ = clientDataStore.SelectCoilDtos()
        .combineLatest(this.discreteFilterChanges$, (coils, _) => coils)
        .debounce(500)
        .subscribe(coils => {

          if (this.agGridOptions.api) {
            let n = [];
            let u = [];
            let d = [];
            let newKnown: string[] = [];
            coils
              .filter(c=>c.isComplete === this.showCompleted || this.showCompleted)
              .forEach(coil => {
                newKnown.push(coil.coilId);
                if (this.knownCoilIds.indexOf(coil.coilId) >= 0){
                  u.push(coil);
                } else {
                  n.push(coil);
                }
              });
            // remove anything that's not there anymore
            let idsToDelete = this.knownCoilIds.filter(x => !newKnown.includes(x));
            d = this.coils.filter(c=>idsToDelete.includes(c.coilId));

            this.knownCoilIds = newKnown;
            this.agGridOptions.api.applyTransaction({
              add: n,
              update: u,
              remove: d});

            // this.agGridOptions.api.sizeColumnsToFit();
          }
          this.coils = coils;
        });

      $scope.$on('$destroy', () => {
        this.coilsSub_.dispose();
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
      localStorage.setItem('coil-list.columns', JSON.stringify(localColumns));
    }

    onReset() {
      localStorage.removeItem('coil-list.columns');
      this.columns = [...this.masterListofColumns];
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
         localStorage.setItem('coil-list.columns', JSON.stringify(localColumns));
      }
    }

    onFilter = () => {
      this.agGridOptions.api.setQuickFilter(this.searchTxt);
    }

    onDiscreteFilterChanged() {
      this.discreteFilterChanges$.onNext({ showCompleted: this.showCompleted }); }

    onCoilsGridOptionsToggle = column => {
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
       localStorage.setItem('coil-list.columns', JSON.stringify(localColumns));

      this.apiResolver.resolve(
        'user.settings.coilsColumns@post',
        data
      );
    };

    //// Filtering

    // filterCoils(searchText) {
    //   this.coilsFilter = searchText;
    //   this.coilsGridApi.grid.refresh();
    //   this.onEditPrintContent();
    // }



    // onAddPrintHeader(mainComp) {
    //   const htmlStr = `
    //         <div id="main-print-body">
    //           <div id="print-content" class="print-content size-1117 pt-printer">
    //             <div class="page-content">
    //               <div class="print-content__main-titles">
    //                 <div class="print-content__title1">EclipsePro</div>
    //                 <div class="print-content__title2">Coils</div>
    //               </div>
    //               <div class="print-content__main-table">
    //                 ${mainComp}
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       `;

    //   return htmlStr;
    // }

    // onPrintFilter(items) {
    //   this.searchFields = this.columns.filter(x => x.isChecked).map(x => x.field);
    //   if (!Object.keys(this.searchData).length) return items;
    //   Object.keys(this.searchData).forEach(key => this.searchData[key] === undefined && delete this.searchData[key]);
    //   const filteredItems = items.filter((row) => {
    //     let match = true;
    //     angular.forEach(this.searchData, (value: string, key) => {
    //       switch (key) {
    //         case 'lengthRemainingFt':
    //         case 'lengthUsedFt':
    //         case 'lengthNonExemptScrapFt': {
    //           if (!(row[key].toString().toLowerCase() + ' ft').match(value.toLowerCase())) {
    //             match = false;
    //           }
    //           break;
    //         }
    //         case 'dateIn': {
    //           if (!this.$filter('age')(row[key]).match(value)) {
    //             match = false;
    //           }
    //           break;
    //         }
    //         case 'query': {
    //           let count = 0;
    //           match = false;
    //           this.searchFields.forEach((field) => {
    //             switch (field) {
    //               case 'lengthRemainingFt':
    //               case 'lengthUsedFt':
    //               case 'lengthNonExemptScrapFt': {
    //                 if ((row[field].toString().toLowerCase() + ' ft').match(value.toLowerCase())) {
    //                   count++;
    //                 }
    //                 break;
    //               }
    //               case 'dateIn': {
    //                 if (this.$filter('age')(row[field]).match(value)) {
    //                   count++;
    //                 }
    //                 break;
    //               }
    //               case 'location.name': {
    //                 if (
    //                   row['location']
    //                     .name
    //                     .toString()
    //                     .toLowerCase()
    //                     .match(value.toLowerCase())
    //                 ) {
    //                   count++;
    //                 }
    //                 break;
    //               }
    //               default: {
    //                 if (
    //                   row[field]
    //                     .toString()
    //                     .toLowerCase()
    //                     .match(value.toLowerCase())
    //                 ) {
    //                   count++;
    //                 }
    //                 break;
    //               }
    //             }
    //           });
    //           if (count > 0) {
    //             match = true;
    //           }
    //           break;
    //         }
    //         default: {
    //           if (!row[key]
    //             .toString()
    //             .toLowerCase()
    //             .match(value.toLowerCase())
    //           ) {
    //             match = false;
    //           }
    //           break;
    //         }
    //       }
    //     });
    //     return match;
    //   });
    //   return filteredItems;
    // };

    // onGetMainData() {
    //   return this.onPrintFilter(this.coils);
    // }

    // onGetMainCol(val, field) {
    //   switch (field) {
    //     case 'lengthRemainingFt':
    //     case 'lengthUsedFt':
    //     case 'lengthNonExemptScrapFt': {
    //       return `<div class="main-con">${this.$filter('unitsFormat')(val, "ft", 0)}</div>`;
    //     }
    //     case 'dateIn': {
    //       return `<div class="main-con">${this.$filter('age')(val)}</div>`;
    //     }
    //     default: {
    //       return `<div class="main-con">${val}</div>`;
    //     }
    //   }

    // }

    // onGetRowForPrint(item) {
    //   this.searchFields = this.columns.filter(x => x.isChecked).map(x => x.field);
    //   let row = `<div class="material-usage-item">`;
    //   this.searchFields.forEach(field => {
    //     if (item[field] || item[field] === 0) {
    //       row += this.onGetMainCol(item[field], field);
    //     } else {
    //       row += `<div class="main-con"></div>`;
    //     }
    //   });
    //   row += '</div>';
    //   return row;
    // }
    // onGetMainPage() {
    //   let htmlStr = `<div class="xl-list-container wi-100">
    //                       <div class="material-usage-item sub-header">
    //                     `;
    //   this.searchFields = this.columns.filter(x => x.isChecked).map(x => x.name);
    //   this.searchFields.forEach(item => {
    //     htmlStr += `<div class="main-con">${item}</div>`;
    //   });
    //   htmlStr += '</div>';
    //   const filteredJobs = this.onGetMainData();
    //   filteredJobs.forEach(item => {
    //     htmlStr += this.onGetRowForPrint(item);
    //   });

    //   htmlStr += '</div>';
    //   return htmlStr;
    // }

    // onEditPrintContent() {
    //   let mainComp = document.getElementById('print-body');
    //   mainComp.innerHTML = ''
    //   let style = document.createElement('style');
    //   style.innerHTML = '@page {size: 11in 17in;}';
    //   document.head.appendChild(style);
    //   const mainStr = this.onGetMainPage();
    //   const htmlStr = this.onAddPrintHeader(mainStr);
    //   mainComp.insertAdjacentHTML('beforeend', htmlStr);
    // }

    openPrintPreview = () => {
      //this.agGridOptions.api.setDomLayout('print')
      window.print();
    };


  }]
};

export default AppCoils;
