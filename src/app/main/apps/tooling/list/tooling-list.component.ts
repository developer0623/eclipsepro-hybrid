import { IAppState } from "../../../../core/services/store";
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IApiResolverService } from "../../../../reference";
import { IUserColumnChoice } from "../../../../core/dto";
import ToolingListTemplate from './tooling-list.html';
import AddToolingModal from './addToolingModal/addToolingModal.component';

const ToolinglistOfColumns = [
  {
    field: 'toolingCode',
    orderField: 'toolingCode',
    name: 'ToolingCode',
    displayName: 'ToolingCode',
    headerCellFilter: 'translate',
    isChecked: true,
  },
  {
    field: 'machines',
    orderField: 'machines',
    name: 'Machine(s)',
    displayName: 'Machine(s)',
    headerCellFilter: 'translate',
    isChecked: true,
  },
  {
    field: 'description',
    orderField: 'description',
    name: 'Description',
    displayName: 'Description',
    headerCellFilter: 'translate',
    isChecked: true,
  },
  {
    field: 'pCodeGroup',
    orderField: 'pCodeGroup',
    name: 'PCodeGroup',
    displayName: 'PCodeGroup',
    headerCellFilter: 'translate',
    isChecked: true,
  },
  {
    field: 'finWidth',
    orderField: 'finWidthNum',
    name: 'FinWidth',
    displayName: 'FinWidth',
    headerCellFilter: 'translate',
    isChecked: true,
  },
];
const ToolingListSelector = (state: IAppState) => {
  return state.ToolingItems.map(ti => ({
    ...ti, machines: ti.machines.reduce((ms, m) => {
      if (ms) {
        return m.description + ", " + ms;
      }
      return m.description;
    }, "")
  }));
}
const ToolingList = {
  selector: 'toolingList',
  bindings: {},
  template: ToolingListTemplate,
  /** @ngInject */
  controller: ['clientDataStore', 'apiResolver', '$mdDialog', '$location', class ToolingListComponent {
    gridApi = {};
    searchFields = [];
    dataSub_;
    columns = ToolinglistOfColumns.filter(x => x.isChecked);
    menuColumns = ToolinglistOfColumns;
    toolings: ReturnType<typeof ToolingListSelector> = [];
    filteredToolings: ReturnType<typeof ToolingListSelector> = [];
    selectedOrderItem = 'toolingCode';
    selectedOrderDirection = '';
    selectedOrder = 'toolingCode';

    constructor(
      clientDataStore: ClientDataStore,
      private apiResolver: IApiResolverService,
      private $mdDialog,
      private $location
    ) {
      // Get subscriptions to realtime updates.
      const sub_ = clientDataStore.SelectTooling().subscribe();

      this.dataSub_ = clientDataStore
        .Selector(ToolingListSelector)
        .subscribe(toolings => {
          console.log('toolings', toolings);
          this.toolings = toolings.map((item: any) => {
            return {
              ...item,
              finWidthNum: parseFloat(item.finWidth)
            };
          });
          this.filteredToolings = this.toolings;
        });
      apiResolver
        .resolve('tooling.columns@get')
        .then((columns: IUserColumnChoice[]) => {
          // overwrite each column's isChecked with the user's preference
          this.menuColumns = ToolinglistOfColumns.map(masterCol => ({
            ...masterCol,
            ...columns.find(x => x.field === masterCol.field),
          }));
          this.columns = this.menuColumns.filter(x => x.isChecked);
        });
    }

    onGridOptionsToggle = column => {
      column.isChecked = !column.isChecked;
      // this.gridOptions.columnDefs = this.columns.filter(x => x.isChecked);

      const data = this.menuColumns.map(x => ({
        field: x.field,
        isChecked: x.isChecked,
      }));
      this.columns = this.menuColumns.filter(x => x.isChecked);
      this.apiResolver.resolve('tooling.columns@post', data);
    };

    onGetFilterIndex(mainTxt, searchTxt) {
      const realTxt = mainTxt.toLowerCase();
      return realTxt.indexOf(searchTxt) > -1;
    }

    onFilter(searchTxt) {
      if (!searchTxt) {
        this.filteredToolings = this.toolings;
      } else {
        const realSearchTxt = searchTxt.toLowerCase();
        this.filteredToolings = this.toolings.filter((item: any) => {
          if (this.onGetFilterIndex(item.description, realSearchTxt)) {
            return true;
          } else if (
            this.onGetFilterIndex(item.machines, realSearchTxt)
          ) {
            return true;
          } else if (
            this.onGetFilterIndex(item.toolingCode, realSearchTxt)
          ) {
            return true;
          } else if (
            this.onGetFilterIndex(item.finWidth, realSearchTxt)
          ) {
            return true;
          } else if (
            this.onGetFilterIndex(item.pCodeGroup, realSearchTxt)
          ) {
            return true;
          } else {
            return false;
          }
        });
      }
    }

    addTooling() {
      this.$mdDialog
        .show({
          ...AddToolingModal,
          clickOutsideToClose: true,
        }).then(result => {
          if (result) {
            const data = { toolingCode: result.toolingCode };
            this.apiResolver.resolve('tooling.add@put', data).then((response) => {
              console.log('addd', response);
              this.$location.path(`/tooling/${result.toolingCode}`);
            });
          }
        });
    }

    onChangeOrder(orderItem) {
      if (orderItem === this.selectedOrderItem) {
        if (this.selectedOrderDirection === '-') {
          this.selectedOrderDirection = '';
        } else {
          this.selectedOrderDirection = '-';
        }
      } else {
        this.selectedOrderItem = orderItem;
        this.selectedOrderDirection = '';
      }

      this.selectedOrder = `${this.selectedOrderDirection}${this.selectedOrderItem}`;

    }

    $onDestroy() {
      this.dataSub_.dispose();
    }
  }],
};

export default ToolingList;
