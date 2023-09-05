import * as _ from "lodash";
import { ClientDataStore } from "../../../../../core/services/clientData.store";
import { IUserColumnChoice } from '../../../../../core/dto';
import { IApiResolverService } from "../../../../../reference";
import { Put } from '../../../../../core/services/clientData.actions';
import AddXl200Modal from '../new/new-xl200-modal.component';
import Temp from './xl200-list.html';
import { UserHasRoles } from '../../../../../core/services/store/user/selectors';

const masterListOfColumns = [
  {
    field: 'machineNumber',
    isChecked: true,
  },
  {
    field: 'description',
    isChecked: true,
  },
  {
    field: 'ipAddress',
    isChecked: true,
  },
  {
    field: 'commName',
    isChecked: true,
  },
  {
    field: 'softwareModel',
    isChecked: true,
  },
  {
    field: 'softwareVersion',
    isChecked: true,
  },
  {
    field: 'uartVersion',
    isChecked: true,
  },
  {
    field: 'serialNumber',
    isChecked: true,
  },
  {
    field: 'machineGroup',
    isChecked: true,
  },
];

const XL200List = {
  selector: 'xlList',
  bindings: {},
  template: Temp,
  /** @ngInject */
  controller: ['clientDataStore', 'apiResolver', '$mdDialog', class XlListComponent {
    userHasAdminRole = false;
    apiResolver_;
    gridApi = {};
    searchFields = [];
    dataSub_;
    columns = masterListOfColumns.filter(x => x.isChecked);
    menuColumns = masterListOfColumns;
    machines = [];

    constructor(
      private clientDataStore: ClientDataStore,
      apiResolver: IApiResolverService,
      private $mdDialog
    ) {
      this.apiResolver_ = apiResolver;

      this.dataSub_ = clientDataStore
        .SelectMachines()
        .filter(ms => ms && ms.length > 0)
        .map(ms => _.sortBy(ms, m => m.description))
        .subscribe(machines => {
          console.log('machines', machines);
          this.machines = machines;
        });        

      clientDataStore
      .Selector(UserHasRoles(['administrator', 'machine-manager'], false))
      .subscribe(userHasAdminRole => {
        this.userHasAdminRole = userHasAdminRole;
      });

      apiResolver
        .resolve('user.settings.machineColumns@get')
        .then((columns: IUserColumnChoice[]) => {
          // overwrite each column's isChecked with the user's preference
          this.menuColumns = masterListOfColumns.map(masterCol => ({
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
      this.apiResolver_.resolve('user.settings.machineColumns@post', data);
    };
    doNewMachine() {
      this.$mdDialog
        .show({ ...AddXl200Modal, clickOutsideToClose: true })
        .then(newMachine =>
          this.clientDataStore.Dispatch(new Put('Machine', newMachine))
        );
    }
    $onDestroy() {
      this.dataSub_.dispose();
    }
  }],
};

export default XL200List;
