import AddPatternModalTemp from './addPatternModal.html';
import { Ams } from '../../../../../amsconfig';
import { PatternDef } from '../../../../../core/dto';

const AddPatternModal = {
    selector: 'addPatternModal',
    template: AddPatternModalTemp,
    controllerAs: '$ctrl',
    /** @ngInject */
    controller: ['$mdDialog', '$http', class AddPatternModalComponent {
        patternName = '';
        err = ''
        constructor(
            private $mdDialog,
            private $http: ng.IHttpService
        ) { }

        onChangeVal() {
            this.err = '';
        }

        cancel() {
            this.$mdDialog.cancel();
        }

        save() {
            if (this.patternName) {
                this.$mdDialog.hide(this.patternName);
            }
        }
    }],
};

export default AddPatternModal;
