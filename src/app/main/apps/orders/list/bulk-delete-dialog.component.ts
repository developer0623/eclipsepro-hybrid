import angular from "angular";
import * as moment from "moment";
import { Ams } from "../../../../amsconfig";
declare let gtag;

const BulkDeleteDialog = {
   /** @ngInject */
   controller: ['$mdDialog', '$http', 'ordIds', class BulkDeleteDialog {
      errors: string[] = [];
      constructor(
         private $mdDialog,
         private $http: angular.IHttpService,
         private ordIds: number[]
      ) {}

      cancel() {
         this.$mdDialog.cancel();
      }
      delete() {
         this.$http
            .post(
               `${Ams.Config.BASE_URL}/api/orderscommand/delete`,
               {
                  ordIds: this.ordIds,
               },
               {
                  headers: {
                     "Content-Type": "application/json",
                  },
               }
            )
            .then((result) => {
               this.$mdDialog.hide(result.data);
               gtag("event", "orderList_bulkDelete", {
                  event_category: "orderList",
                  event_label: "bulkDelete",
                  value: this.ordIds.length,
               });
            })
            .catch((result) => {
               this.errors = result.data.errors;
            });
      }
   }],
   controllerAs: "$ctrl",
   template: `<div class="item-settings-dialog" aria-label="Item Dialog">
    <div class="item-settings-dialog__wrapper">
      <div class="item-settings-dialog__header">Delete Order(s)</div>

      <md-content> </md-content>
      <md-content class="item-settings-dialog__delete">

        <div class="item-settings-dialog__content">Are you sure you want to delete {{$ctrl.ordIds.length}} orders?</div>
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
          ng-click="$ctrl.delete()"
        >
          DELETE
        </div>
      </md-dialog-actions>
    </div>
  </div>`,
   parent: angular.element(document.body),
   clickOutsideToClose: true,
};

export default BulkDeleteDialog;
