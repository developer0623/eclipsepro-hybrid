import angular from "angular";
import { RebundleResult } from "../../../../../core/dto";
import { Ams } from "../../../../../amsconfig";
declare let gtag;

const CombineToNewBundlesDialog = {
  /** @ngInject */
  controller: ['$mdDialog', '$http', 'items', 'itemIds', 'ordId', class CombineDialog {
    bundleGroupOptions = [
      { field: 'bundleGroup' },
      { field: 'pieceMark' },
      { field: 'itemUser1' },
      { field: 'itemUser2' },
      { field: 'itemUser3' },
      { field: 'itemUser4' },
      { field: 'itemUser5' },
      { field: 'none' },
    ];

    bundleGroupField: string = this.bundleGroupOptions[0].field;

    errors: string[] = [];
    constructor(
      private $mdDialog,
      private $http: angular.IHttpService,
      private items,
      private itemIds: number[],
      private ordId: number
    ) {
      let lsBundleGroupField = localStorage.getItem('order.bundleGroupField');
      if (lsBundleGroupField) {
        if (
          this.bundleGroupOptions.findIndex(
            o => o.field === lsBundleGroupField
          ) >= 0
        ) {
          this.bundleGroupField = lsBundleGroupField;
        }
      }
    }

    cancel() {
      this.$mdDialog.cancel();
    }
    save() {
      localStorage.setItem('order.bundleGroupField', this.bundleGroupField);
      this.$http
        .post<RebundleResult>(
          `${Ams.Config.BASE_URL}/api/ordercommand/rebundle/combineitems`,
          {
            ordId: this.ordId,
            items: this.items,
            itemIds: this.itemIds,
            targetBundle: -1, // magic number for 'new bundle'
            bundleGroupField: this.bundleGroupField,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(result => {
          this.$mdDialog.hide(result.data);
          gtag('event', 'orderDetail_rebundle_combineitems', {
            event_category: 'orderDetail',
            event_label: 'rebundle/combineitems',
            value: this.itemIds.length,
          });
        })
        .catch(result => {
          this.errors = result.data.errors;
        });
    }
  }],
  controllerAs: '$ctrl',
  template: `<div class="item-settings-dialog" aria-label="Item Dialog">
      <div class="item-settings-dialog__wrapper">
        <div class="item-settings-dialog__header">Combine To New Bundles</div>
        <div class="item-settings-dialog__title">COMBINE BY:</div>

        <md-content> </md-content>
        <md-content class="item-settings-dialog__tab">
          <md-input-container class="input-container">
            <md-select
              ng-model="$ctrl.bundleGroupField"
              placeholder="Choose bundle group field"
              required
            >
              <md-option
                ng-value="option.field"
                ng-repeat="option in $ctrl.bundleGroupOptions"
                >{{option.field | translate}}</md-option
              >
            </md-select>
          </md-input-container>

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
            SAVE
          </div>
        </md-dialog-actions>
      </div>
    </div>`,
  parent: angular.element(document.body),
  clickOutsideToClose: true,
};
export default CombineToNewBundlesDialog;
