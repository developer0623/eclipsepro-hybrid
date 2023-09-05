import AddToolingModalTemplate from './addToolingModal.html';
const AddToolingModal = {
    selector: 'addToolingModal',
    template: AddToolingModalTemplate,
    controllerAs: '$ctrl',
    /** @ngInject */
    controller: ['$mdDialog', class AddToolingModalComponent {
        toolingCode = '';
        constructor(
            private $mdDialog
        ) { }

        cancel() {
            this.$mdDialog.cancel();
        }

        save() {
            this.$mdDialog.hide({ toolingCode: this.toolingCode });
        }
    }],
};

export default AddToolingModal;
