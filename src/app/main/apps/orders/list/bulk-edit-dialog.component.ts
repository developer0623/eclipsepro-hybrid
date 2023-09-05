import angular from 'angular';
import * as moment from "moment";
import { Ams } from '../../../../amsconfig';
declare let gtag;

const BulkEditDialog = {
  /** @ngInject */
  controller: ['$mdDialog', '$http', 'ordIds', class BulkEditDialog {
    // todo: add configuration to specify which fields can be bulk edited
    fieldOptions = [
      { field: 'requiredDate', type: 'Date' },
      { field: 'shipDate', type: 'Date' },
      { field: 'truckNumber', type: 'string' },
      { field: 'user1', type: 'string', title: 'orderUser1' },
      { field: 'user2', type: 'string', title: 'orderUser2' },
      { field: 'user3', type: 'string', title: 'orderUser3' },
      { field: 'user4', type: 'string', title: 'orderUser4' },
      { field: 'user5', type: 'string', title: 'orderUser5' },
      { field: 'stagingBay', type: 'string' },
      { field: 'loadingDock', type: 'string' },
      { field: 'operatorMessage', type: 'string' },
    ];

    bulkEditField = this.fieldOptions[0];
    value: '';

    errors: string[] = [];
    constructor(
      private $mdDialog,
      private $http: angular.IHttpService,
      private ordIds: number[]
    ) {
      // load last used field from local storage
      let lsBulkEditField = localStorage.getItem('orders-list.bulkEditField');
      if (lsBulkEditField) {
        let idx = this.fieldOptions.findIndex(o => o.field === lsBulkEditField);
        if (idx >= 0) {
          this.bulkEditField = this.fieldOptions[idx];
        }
      }
    }

    cancel() {
      this.$mdDialog.cancel();
    }
    save() {
      localStorage.setItem('orders-list.bulkEditField', this.bulkEditField.field);
      let result = '';
      switch (this.bulkEditField.type) {
        case 'Date':
          result = moment(this.value).format('MM/DD/YYYY');
          break;
        default:
          result = this.value;
          break;
      }

      this.$http
        .patch(
          `${Ams.Config.BASE_URL}/api/orderscommand/savechanges`,
          {
            ordIds: this.ordIds,
            patch: {
              operations: [
                {
                  path: `/job/${this.bulkEditField.field}`,
                  value: result,
                  op: 'replace',
                },
              ],
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(result => {
          this.$mdDialog.hide(result.data);
          gtag('event', 'orderList_bulkEdit', {
            event_category: 'orderList',
            event_label: 'bulkEdit',
            value: this.ordIds.length,
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
      <div class="item-settings-dialog__header">Bulk Edit Value</div>

      <md-content> </md-content>
      <md-content class="item-settings-dialog__tab">
        <md-input-container class="input-container">
          <md-select
            ng-model="$ctrl.bulkEditField"
            placeholder="Choose edit field"
            required
          >
            <md-option
              ng-value="option"
              ng-repeat="option in $ctrl.fieldOptions"
              >{{option.title || option.field | translate}}</md-option
            >
          </md-select>
        </md-input-container>

        <md-input-container class="input-container" ng-switch="$ctrl.bulkEditField.type">
          <md-datepicker
            ng-switch-when="Date"
            ng-model="$ctrl.value"
            md-placeholder="Enter date"
          ></md-datepicker>
          <input ng-switch-when="string" ng-model="$ctrl.value"></input>
          <span ng-switch-default>Field type not defined</span>
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

export default BulkEditDialog;
