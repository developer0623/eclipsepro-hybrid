import { ClientDataStore } from '../../../../core/services/clientData.store';
import { UserHasRoles } from "../../../../core/services/store/user/selectors";
import { IApiResolverService } from "../../../../reference";
import { IMachine, ToolingDef } from "../../../../core/dto";
import { Ams } from '../../../../amsconfig';
import { Put } from "../../../../core/services/clientData.actions";
import ToolingDetailTemplate from './tooling-detail.html';
import { SingleTooling } from './selectors';
import AddMachineModal from './addMachineModal/addMachineModal.component';

type ToolingDetailModel = ReturnType<ReturnType<typeof SingleTooling>>;

const ToolingDetail = {
  selector: 'toolingDetail',
  bindings: {},
  template: ToolingDetailTemplate,
  /** @ngInject */
  controller: ['clientDataStore', 'apiResolver', '$http', '$stateParams', '$mdDialog', '$mdToast', class ToolingDetailComponent {
    toolingCode: string;
    tooling: ToolingDetailModel;
    userHasEditorRole = false;
    machines: IMachine[] = [];
    toolingKeys = [
      {
        field: 'toolingCode',
        name: 'ToolingCode',
        isEditable: false,
      },
      {
        field: 'description',
        name: 'Description',
        isEditable: true,
      },
      {
        field: 'pCodeGroup',
        name: 'PCodeGroup',
        isEditable: true,
      },
      {
        field: 'finWidth',
        name: 'FinWidth',
        isEditable: true,
      },
      {
        field: 'legHeight',
        name: 'LegHeight',
        isEditable: true,
      },
      {
        field: 'profile',
        name: 'Profile',
        isEditable: true,
      },
    ];
    machineKeys = [
      {
        field: 'name',
        name: 'Name',
        isChecked: true,
        isEditable: false,
      },
      {
        field: 'calcLength',
        name: 'Calc Length',
        isChecked: true,
        isEditable: true,
        isSelect: true,
      },
      {
        field: 'description',
        name: 'Description',
        isWarning: true,
        isChecked: true,
        isEditable: true,
      },
      {
        field: 'finWidth',
        name: 'Fin Width',
        isWarning: true,
        isChecked: true,
        isEditable: true,
      },
      {
        field: 'holeCount',
        name: 'Hole Count',
        isChecked: true,
        isEditable: true,
        isSelect: true,
      },
      {
        field: 'holeSpace',
        name: 'Hole Space',
        isChecked: true,
        isEditable: true,
      },
      {
        field: 'legHeight',
        name: 'Leg Height',
        isWarning: true,
        isChecked: true,
        isEditable: true,
      },
      {
        field: 'pcodeGroup',
        name: 'PcodeGroup',
        isWarning: true,
        isChecked: true,
        isEditable: true,
      },
      {
        field: 'stageBay',
        name: 'Stage Bay',
        isChecked: true,
        isEditable: true,
      },
      {
        field: 'loadDock',
        name: 'Load Dock',
        isChecked: true,
        isEditable: true,
      },
    ];
    showedMachineKeys = [];
    checkedMachineKeys = [];

    statuses = [
      { value: true, text: 'true' },
      { value: false, text: 'false' },
    ];
    roleSub$: Rx.IDisposable;
    machinesSub$: Rx.IDisposable;
    toolingSub$: Rx.IDisposable;

    constructor(
      private clientDataStore: ClientDataStore,
      private apiResolver: IApiResolverService,
      $http: ng.IHttpService,
      $stateParams: { id: string },
      private $mdDialog,
      private $mdToast
    ) {
      this.toolingCode = $stateParams.id;

      this.roleSub$ = clientDataStore
        .Selector(UserHasRoles(['tooling-editor', 'administrator'], false))
        .subscribe(userHasEditorRole => {
          this.userHasEditorRole = userHasEditorRole;
        });

      $http
        .get<ToolingDef>(
          `${Ams.Config.BASE_URL}/_api/tooling/${this.toolingCode}`
        )
        .then(response => {
          this.clientDataStore.Dispatch(new Put('ToolingDefs', response.data));
        });

      this.machinesSub$ = clientDataStore
        .Selector(state => state.Machine)
        .subscribe(machines => (this.machines = machines));

      this.toolingSub$ = clientDataStore
        .Selector(SingleTooling(this.toolingCode))
        .subscribe(tooling => {
          if (tooling) {
            this.tooling = tooling;

            this.showedMachineKeys = this.machineKeys.filter(item => {
              switch (item.field) {
                case 'description':
                  return this.tooling.needNormalizing.descriptions;
                case 'pcodeGroup':
                  return this.tooling.needNormalizing.pCodeGroups;
                case 'finWidth':
                  return this.tooling.needNormalizing.finWidths;
                case 'legHeight':
                  return this.tooling.needNormalizing.legHeights;
                default:
                  return true;
              }
            });
            this.checkedMachineKeys = this.showedMachineKeys;
          }
        });
    }

    onChangeDetail(value, field) {
      if (!this.userHasEditorRole) {
        this.toast('You do not have permission to edit toolings');
        return;
      }
      const data = {
        [field]: value,
        id: this.toolingCode,
      };
      console.log('update', value, field);
      this.apiResolver
        .resolve<ToolingDef>('tooling.update@patch', data)
        .then(result => {
          this.toast('Tooling updated.');
          console.log(result);
          this.clientDataStore.Dispatch(new Put('ToolingDefs', result));
        })
        .catch(err =>
          this.toast('Update failed.' + err.data.errors.join('\n'))
        );
    }

    onChangeMachineDetail(value, field, machine) {
      if (!this.userHasEditorRole) {
        this.toast('You do not have permission to edit toolings');
        return;
      }
      const data = {
        [field]: value,
      };
      console.log('update', value, field);
      this.apiResolver
        .resolve<ToolingDef>('tooling.machine@patch', {
          toolingCode: this.toolingCode,
          machineNumber: machine.machineNumber,
          ...data,
        })
        .then(result => {
          this.toast('Tooling updated.');
          console.log(result);
          this.clientDataStore.Dispatch(new Put('ToolingDefs', result));
        })
        .catch(err =>
          this.toast('Update failed.' + err.data.errors.join('\n'))
        );
    }

    addMachine() {
      if (!this.userHasEditorRole) {
        this.toast('You do not have permission to edit toolings');
        return;
      }
      const machines = this.machines.filter(ms => {
        const index = this.tooling.machines.findIndex(
          item => item.machineNumber === ms.machineNumber
        );
        return index === -1;
      });
      this.$mdDialog
        .show({
          ...AddMachineModal,
          locals: {
            machines,
          },
          clickOutsideToClose: true,
        })
        .then(dialogResult => {
          if (dialogResult) {
            console.log('result----', dialogResult);
            this.apiResolver
              .resolve<ToolingDef>('tooling.machine@add', {
                toolingCode: this.toolingCode,
                machineNumber: dialogResult.selectedMachine,
              })
              .then(result => {
                this.toast('Tooling updated.');
                console.log(result);
                this.clientDataStore.Dispatch(new Put('ToolingDefs', result));
              })
              .catch(err =>
                this.toast('Update failed.' + err.data.errors.join('\n'))
              );
          }
        });
    }

    deleteMachine(machine) {
      if (!this.userHasEditorRole) {
        this.toast('You do not have permission to edit toolings');
        return;
      }
      this.apiResolver
        .resolve<ToolingDef>('tooling.machine@delete', {
          toolingCode: this.toolingCode,
          machineNumber: machine.machineNumber,
        })
        .then(result => {
          this.toast('Tooling updated.');
          console.log(result);
          this.clientDataStore.Dispatch(new Put('ToolingDefs', result));
        })
        .catch(err =>
          this.toast('Update failed.' + err.data.errors.join('\n'))
        );
    }

    onGridOptionsToggle = column => {
      column.isChecked = !column.isChecked;
      this.checkedMachineKeys = this.showedMachineKeys.filter(x => x.isChecked);
    };

    $onDestroy() {
      if (this.roleSub$) {
        this.roleSub$.dispose();
      }
      if (this.machinesSub$) {
        this.machinesSub$.dispose();
      }
      if (this.toolingSub$) {
        this.toolingSub$.dispose();
      }
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
  }],
};

export default ToolingDetail;
