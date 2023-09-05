import { IMachine } from '../../../../../core/dto';
import { Ams } from '../../../../../amsconfig';

const AddXl200Modal = {
  selector: 'addXl200Modal',
  template: `
    <div aria-label="Add Xl200">
      <div class="item-settings-dialog__wrapper">
        <div class="item-settings-dialog__header">Add Xl200</div>
        <md-content class="main-container">
          <md-input-container class="md-block main-input">
            <input
              ng-model="$ctrl.description"
              placeholder="Description"
              required
            />
          </md-input-container>
        </md-content>
        <md-content>
          <md-list class="error-list">
            <md-list-item class="error-item" ng-repeat="err in $ctrl.errors">
              <i class="mdi mdi-close"></i>
              <p>{{err}}</p>
            </md-list-item>
          </md-list>
        </md-content>

        <md-dialog-actions layout="row" class="item-settings-dialog__footer">
          <span flex></span>
          <div class="item-settings-dialog__button" ng-click="$ctrl.cancel()">
            CANCEL
          </div>
          <div
            class="item-settings-dialog__button x--active"
            ng-click="$ctrl.save()"
          >
            Save
          </div>
        </md-dialog-actions>
      </div>
    </div>
  `,
  controllerAs: '$ctrl',
  /** ngInject */
  controller: ['$mdDialog', '$http', class AddXl200ModalComponent {
    description: string;
    errors: string[] = [];
    constructor(private $mdDialog, private $http: ng.IHttpService) { }
    cancel() {
      this.$mdDialog.cancel();
    }

    save() {
      this.$http
        .put<IMachine>(Ams.Config.BASE_URL + '_api/machine', {
          description: this.description,
          type: 'XL200'
        })
        .then(response => {
          this.$mdDialog.hide(response.data);
        })
        .catch(err => {
          this.errors = err.data.errors;
        });
    }
  }],
};

export default AddXl200Modal;
