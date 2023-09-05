import { IMachineTools } from '../../../../../core/dto';
import { Ams } from '../../../../../amsconfig';
import { Grid, GridOptions } from 'ag-grid-community';

const XL200Tools = {
  selector: 'xl200Tools',
  template: `
    <div class="machine-detail">
      <div class="machine-detail__item">
        <div class="machine-detail__title">Instance:</div>
        <div class="machine-detail__content">
          {{$ctrl.currentTools.libraryName}}
        </div>
      </div>
      <div class="machine-detail__item">
        <div class="machine-detail__title">Id:</div>
        <div class="machine-detail__content">
          {{$ctrl.currentTools.libraryId}}
        </div>
      </div>
      <div class="machine-detail__item">
        <div class="machine-detail__title">Controller List:</div>
        <div class="machine-detail__content">
          {{$ctrl.currentTools.controllerListId}}
        </div>
      </div>
      <div class="machine-detail__item">
        <div class="machine-detail__title">Date:</div>
        <div class="machine-detail__content">
          {{$ctrl.currentTools.date | date : 'short'}}
        </div>
      </div>
      <div class="machine-detail__item">
        <div class="machine-detail__title">Model:</div>
        <div class="machine-detail__content">
          {{$ctrl.currentTools.softwareModel}}
        </div>
      </div>
      <div class="machine-detail__item">
        <div class="machine-detail__title">Version:</div>
        <div class="machine-detail__content">
          {{$ctrl.currentTools.softwareVersion}}
        </div>
      </div>
    </div>
    <div ag-grid="$ctrl.xl200ToolsGridOptions" class="ag-theme-balham tools-grid"></div>
    `,
  bindings: {
    machineId: '=',
  },
  controller: ['$http', '$filter', class XL200ToolsComponent {
    machineId: number;
    currentTools: IMachineTools;
    xl200ToolsGridOptions: GridOptions;
    masterListofToolColumns = [
      {
        field: 'tool',
        headerName: 'tool',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'name',
        headerName: 'toolName',
        filter: 'agTextColumnFilter',
      },
      {
        field: 'press',
        headerName: 'press',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'gag',
        headerName: 'gag',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'offsetIn',
        headerName: 'xOffset',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 3)},
      },
      {
        field: 'yOffsetIn',
        name: 'yOffset',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 3)},
      },
      {
        field: 'axis',
        headerName: 'Axis',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'kerfAdjustIn',
        headerName: 'Kerf Adjustment',
        filter: 'agNumberColumnFilter',
        valueFormatter: params => { return this.$filter('unitsFormat')(params.value, "in", 3)},
      },
    ];

    /** @ngInject */
    constructor(
      private $http: angular.IHttpService,
      private $filter
    ) {

      const localSortitem = localStorage.getItem('xl200.tools.columnsSort');
      let sortedColumns = [];
      if(!!localSortitem) {
         const sortItem = JSON.parse(localSortitem);
         sortedColumns = this.masterListofToolColumns.map(col => {
            if(col.field === sortItem.field) {
               return { ...col, sort: sortItem.direction}
            }
            return col;
         })
      } else {
         sortedColumns = [...this.masterListofToolColumns];
      }
      this.xl200ToolsGridOptions = {
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
        columnDefs: sortedColumns, //this.columns.map(({isChecked, ...rest}) => {return {...rest, hide: !isChecked}}),
        getRowNodeId: (data) => data.tool,
        //onColumnResized: this.onColumnResized,
        enableCellChangeFlash: true,
        onSortChanged: this.onSortChanged,
     };
    }

    onSortChanged = (event) => {
      const sortColumns = this.xl200ToolsGridOptions.api.getSortModel();
      if (sortColumns.length > 0) {
         const sortItem = {
            field: sortColumns[0].colId,
            direction: sortColumns[0].sort
         }
         localStorage.setItem('xl200.tools.columnsSort', JSON.stringify(sortItem));
      }
    }

    $onChanges() {
      if (this.machineId) {
        Rx.Observable.fromPromise(
          this.$http.get<IMachineTools[]>(
            Ams.Config.BASE_URL + `/_api/machine/${this.machineId}/tools`
          )
        ).subscribe(response => {
          this.currentTools = response.data[0];
          if (this.xl200ToolsGridOptions.api) {
            this.xl200ToolsGridOptions.api.setRowData(this.currentTools.tools);
            this.xl200ToolsGridOptions.api.sizeColumnsToFit();
          }
        });
      }
    }
  }],
};

export default XL200Tools;
