import { machineDetailsViewModel } from './selectors';
import { ClientDataStore } from "../../../../../core/services/clientData.store";
import { IApiResolverService } from "../../../../../reference";
import { UserHasRole, UserHasRoles } from '../../../../../core/services/store/user/selectors';
import { Put } from '../../../../../core/services/clientData.actions';
import { LockdownCode, IMachine, MachinePattern, ReferenceColumnsDef } from '../../../../../core/dto';
import Temp from './xl200-detail.html';
import { Ams } from "../../../../../amsconfig";

const XL200Detail = {
  selector: 'xlDetail',
  bindings: {},
  template: Temp,
  /** @ngInject */
  controller: ['$http', 'clientDataStore', 'apiResolver', '$stateParams', '$mdToast', class XlDetailComponent {
    dataSub_;
    machineId: number;
    machine: ReturnType<typeof machineDetailsViewModel>;
    userHasAdminRole = false;
    test = 1;
    machineKeys = [
      {
        field: 'machineNumber',
        name: 'Machine Number',
        isEditable: false,
      },
      {
        field: 'isActive',
        name: 'Active Status',
        isEditable: false,
      },
      {
        field: 'isHoleCount',
        name: 'Hole Count',
        isEditable: false,
      },
      {
        field: 'bundleIdPrefix',
        name: 'BundleId Prefix',
        isEditable: true,
      },
      {
        field: 'description',
        name: 'Description',
        isEditable: true,
      },
      {
        field: 'ipAddress',
        name: 'IP Address',
        isEditable: true,
      },
      {
        field: 'commName',
        name: 'CommName',
        isEditable: false,
      },
      {
        field: 'serialNumber',
        name: 'Serial Number',
        isEditable: false,
      },
      {
        field: 'softwareModel',
        name: 'Software Model',
        isEditable: false,
      },
      {
        field: 'softwareVersion',
        name: 'Software Version',
        isEditable: false,
      },
      {
        field: 'uartVersion',
        name: 'UART Version',
        isEditable: false,
      },
      {
        field: 'machineGroup',
        name: 'Machine Group',
        isEditable: false,
      },
      {
        field: 'defaultPatternName',
        name: 'Default Pattern',
        isEditable: true,
        // todo: add drop down to select pattern name
      },
    ];
    pattern: MachinePattern[];
    xlPatternsColumns = [
       {
          field: "machineNumber",
          displayName: "Machine",
       },
       {
          field: "pattern",
          displayName: "Pattern",
       },
       {
          field: "operations",
          displayName: "Punches",
       },
       {
          field: "status",
          displayName: "Status",
       },
    ];
    xlPatternSubColumns = [
       {
          field: "idType",
          displayName: "Type",
       },
       {
          field: "tool",
          displayName: "Tool",
       },
       {
          field: "xOffset",
          displayName: "Offset",
       },
       {
          field: "xReference",
          displayName: "Reference",
       },
       {
          field: "yOffset",
          displayName: "Y-Offset",
       },
       {
          field: "yReference",
          displayName: "Y-Reference",
       },
    ];

    referenceColumns: ReferenceColumnsDef[] = [
      { value: "LeadingEdge", text: "Leading Edge" },
      { value: "TrailingEdge", text: "Trailing Edge" },
      { value: "LeadingCenter", text: "Leading Center" },
      { value: "TrailingCenter", text: "Trailing Center" },
      { value: "EvenSpacing", text: "EvenSpacing" },
      { value: "SpacingLimit", text: "Spacing Limit" },
      { value: "KerfAdjust", text: "Kerf Adjust" },
      { value: "Independent", text: "Independent" },
      { value: "ProportionalMin", text: "Proportional Min" },
      { value: "ProportionalMax", text: "Proportional Max" },
      { value: "ProportionalLimit", text: "Proportional Limit" },
   ];

   yReferenceColumns: ReferenceColumnsDef[] = [
      { value: "None", text: "None" },
      { value: "CenterPlus", text: "Center+" },
      { value: "CenterMinus", text: "Center-" },
      { value: "PlusEdge", text: "+Edge" },
      { value: "MinusEdge", text: "-Edge" },
      { value: "MacroPlus", text: "Macro+" },
      { value: "MacroMinus", text: "Macro-" },
   ];

    constructor(
      private $http: ng.IHttpService,
      private clientDataStore: ClientDataStore,
      private apiResolver: IApiResolverService,
      $stateParams: { id: string },
      private $mdToast
    ) {
      this.machineId = Number($stateParams.id);
      console.log('machine-id', this.machineId)

      $http
        .get<MachinePattern[]>(
            `${Ams.Config.BASE_URL}/_api/punchpatterns/machine/${this.machineId}`
        )
        .then((response) => {
            this.pattern = response.data.slice(0, 100); // show only 100 items for performance
        });

      this.dataSub_ = clientDataStore
        .Selector(state => state.Machine)
        .where(ms => ms.length > 0)
        .map(ms => {
          const m = ms.find(m => m.machineNumber === this.machineId);
          return machineDetailsViewModel(m);
        })
        .subscribe(machine => {
          this.machine = machine;
          console.log('this.machine', this.machine);
        });

      clientDataStore
        .Selector(UserHasRoles(['administrator', 'machine-manager'], false))
        .subscribe(userHasAdminRole => {
          this.userHasAdminRole = userHasAdminRole;
        });
    }

    onOrderLockdownChange(code: LockdownCode) {
      const model = this.machine.orderLockdownModel.find(
        x => x.label === code.label
      );
      this.onChangeDetail([code], 'orderLockdownModel');
    }
    onPatternLockdownChange(code: LockdownCode) {
      const model = this.machine.patternLockdownModel.find(
        x => x.label === code.label
      );
      this.onChangeDetail([code], 'patternLockdownModel');      
    }

    onChangeEnforcedSetups() {
      this.onChangeDetail(
        this.machine.eclipseEnforcedSetups,
        'eclipseEnforcedSetups'
      );
    }

    onChangeDetail(value, field: string) {
      if (!this.userHasAdminRole) {
        this.toast('You do not have permission to change this setting');
        return;
      }
      const data = {
        machineNumber: this.machine.machineNumber,
        [field]: value,
      };
      this.apiResolver
        .resolve<IMachine>('machine.machineUpdate@patch', data)
        .then(
          response => {
            this.clientDataStore.Dispatch(new Put('Machine', response));
            return this.toast('Machine updated successfully');
          },
          ex =>
            this.toast(
              'Machine change was not saved. ' +
              ex.data.errors.reduce((x, y) => x + ' ' + y)
            )
        );
    }

    onClose(selectedItem) {
      selectedItem.isOpen = !selectedItem.isOpen;
   }

    private toast(textContent: string) {
      this.$mdToast.show(
        this.$mdToast
          .simple()
          .textContent(textContent)
          .position('top right')
          .hideDelay(2000)
          .parent('#content')
      );
    }
    $onDestroy() {
      this.dataSub_.dispose();
    }
  }],
};

export default XL200Detail;
