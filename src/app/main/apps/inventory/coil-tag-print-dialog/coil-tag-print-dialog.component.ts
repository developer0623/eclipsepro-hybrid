import { ICoilDto, IPrintTemplate, IInstalledPrinters } from '../../../../core/dto';
import { Ams } from "../../../../amsconfig";
const CoilTagPrintDialog = {
    selector: 'coilTagPrintDialog',
    template: ` <div class="item-settings-dialog" aria-label="Print coil tag">
      <div class="item-settings-dialog__wrapper">
        <div class="item-settings-dialog__header">Print coil tag</div>
        <div class="item-settings-dialog__title">Print coil tag: {{$ctrl.coil.coilId}}</div>

        <md-content> </md-content>
        <md-content class="item-settings-dialog__tab">
          <md-input-container class="input-container">
            <md-select
              ng-model="$ctrl.selectedPrinter"
              placeholder="Choose printer"
              required
            >
              <md-option
                ng-value="printer.name"
                ng-repeat="printer in $ctrl.printers.printers"
                >{{printer.name}}</md-option
              >
            </md-select>
          </md-input-container>

          <md-input-container class="input-container">
            <md-select
              ng-model="$ctrl.selectedCoilTag"
              placeholder="Choose coil tag"
              required
            >
              <md-option ng-value="tag.name" ng-repeat="tag in $ctrl.coilTags"
                >{{tag.name}}</md-option
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
            PRINT
          </div>
        </md-dialog-actions>
      </div>
    </div>`,
    controllerAs: '$ctrl',
    /** @ngInject */
    controller: ['$mdDialog', '$http', 'coilTags', 'printers', 'coil', class CoilTagPrintDialogComponent {
        selectedCoilTag: string;
        selectedPrinter: string;
        errors: string[];
        constructor(
            private $mdDialog,
            private $http: ng.IHttpService,
            private coilTags: { name: string }[],
            private printers: IInstalledPrinters,
            private coil: ICoilDto
        ) {
            this.selectedPrinter = localStorage.getItem('lastUsedCoilTagPrinterName');
            this.selectedCoilTag = localStorage.getItem('lastUsedCoilTagName');
        }
        cancel() {
            this.$mdDialog.cancel();
        }
        save() {
            this.$http({
                url: `${Ams.Config.BASE_URL}/_api/coil/${this.coil.coilId}/print`,
                params: {
                    printerName: this.selectedPrinter,
                    tagName: this.selectedCoilTag,
                },
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(result => {
                    localStorage.setItem(
                        'lastUsedCoilTagPrinterName',
                        this.selectedPrinter
                    );
                    localStorage.setItem('lastUsedCoilTagName', this.selectedCoilTag);
                    this.$mdDialog.hide(result.data);
                })
                .catch(result => {
                    this.errors = result.data.errors;
                });
        }
    }],
};

export default CoilTagPrintDialog;
