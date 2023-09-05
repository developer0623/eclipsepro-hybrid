import { IMachine } from "../../../../../core/dto";
import AddMachineModalTemplate from './addMachineModal.html';
const AddMachineModal = {
    selector: 'addMachineModal',
    template: AddMachineModalTemplate,
    controllerAs: '$ctrl',
    /** @ngInject */
    controller: ['$mdDialog', '$http', 'machines', class AddMachineModalComponent {
        machines = [];
        selectedMachine = 0;
        constructor(
            private $mdDialog,
            private $http: ng.IHttpService,
            machines: IMachine[]
        ) {
            this.machines = machines;
        }

        cancel() {
            this.$mdDialog.cancel();
        }

        save() {
            this.$mdDialog.hide({ selectedMachine: this.selectedMachine });
        }
    }],
};
export default AddMachineModal;
