import angular from "angular";
import { Ams } from "../../../../../amsconfig";
import { IMaterialDto, ToolingDef } from '../../../../../core/dto';
declare let gtag;

const OrderDefChangeDialog = {
  controller: ['$mdDialog', '$http', 'ordId', 'orderCode', 'materialCode', 'toolingCode', class DefChangeDialog {
    

    errors: string[] = [];
    materials: IMaterialDto[] = [];
    toolings: ToolingDef[] = [];
    selectedMaterial: IMaterialDto;
    matSearchText: string;
    constructor(
      private $mdDialog,
      private $http: angular.IHttpService,
      private ordId: number,
      private orderCode: string,
      private materialCode: string,
      private toolingCode: string,
    ) {

      this.$http.get<IMaterialDto[]>(`${Ams.Config.BASE_URL}/api/material?skip=0&take=1000&type=ALL`)
        .then(result => {
          this.materials = result.data.sort((a, b) => a.materialCode.localeCompare(b.materialCode));
          this.selectedMaterial = this.materials.find(m => m.materialCode === this.materialCode);
        });

      this.$http.get<ToolingDef[]>(`${Ams.Config.BASE_URL}/_api/tooling?skip=0&take=1000&type=ALL`)
        .then(result => {
          this.toolings = result.data.sort((a, b) => a.toolingCode.localeCompare(b.toolingCode));
        });
    }

    searchMaterial(searchText) {
      return this.materials.filter(item => {
        return item.materialCode.concat(item.description).toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      });
    }

    cancel() {
      this.$mdDialog.cancel();
    }
    save() {
      this.$http
        .post<any>(
          `${Ams.Config.BASE_URL}/api/ordercommand/changedef`,
          {
            ordId: this.ordId,
            orderCode: this.orderCode,
            materialCode: this.selectedMaterial.materialCode,
            toolingCode: this.toolingCode
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(result => {
          this.$mdDialog.hide(result.data);
          gtag('event', 'orderDetail_changeDef', {
            event_category: 'orderDetail',
            event_label: 'rebundle/changeDef',
            value: 1,
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
        <div class="item-settings-dialog__header">Change Order Definition</div>
        <!--<div class="item-settings-dialog__title">COMBINE BY:</div>-->

        <md-content> </md-content>
        <md-content class="item-settings-dialog__tab">
          <md-input-container class="input-container">
            <label>Order Code</label>
            <input ng-model="$ctrl.orderCode"></input>
          </md-input-container>
          <md-input-container class="input-container">
            <label>Material Code</label>
            <md-autocomplete md-menu-class="autocomplete-search" md-autoselect="true" md-min-length="0" md-clear-button="true" 
              md-selected-item="$ctrl.selectedMaterial" md-search-text="$ctrl.matSearchText" 
              md-items="material in $ctrl.searchMaterial($ctrl.matSearchText)" 
              md-item-text="material.materialCode">
              <md-item-template>
                <span class="search-title">{{material.materialCode}}</span>
                <span class="search-detail">{{material.description}} | On Hand:{{material.onHandFt | unitsFormat :"ft":0}}</span>
              </md-item-template>
            </md-autocomplete>
          </md-input-container>
          <md-input-container class="input-container">
            <label>Tooling Code</label>
            <md-select ng-model="$ctrl.toolingCode">
              <md-select-header>
                <span>Tooling Code</span>
              </md-select-header>
              <md-option ng-value="tool.toolingCode" ng-repeat="tool in $ctrl.toolings">{{ tool.toolingCode }}</md-option>
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
export default OrderDefChangeDialog;
