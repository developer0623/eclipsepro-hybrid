import angular from 'angular';
import { ClientDataStore } from "../../../../core/services/clientData.store";
import { IBundlingRule } from '../../../../core/dto';
import { Ams } from '../../../../amsconfig';
import { newBundlerRuleController } from './addBundlerRuleDialog';
import Temp from './bundling.html';
import { UserHasRoles } from '../../../../core/services/store/user/selectors';

const Bundling = {
  selector: 'bundling',
  template: Temp,
  bindings: {},
  /** @ngInject */
  controller: ['$scope', '$http', '$mdToast', 'clientDataStore', '$mdDialog', class BundlingComponent {
    userHasAdminRole = false;
    systemSortOptions = [
      { value: 'LongToShort', text: 'Long To Short' },
      { value: 'ShortToLong', text: 'Short To Long' },
    ];
    sortOptions = [
      { value: 'LongToShort', text: 'Long To Short' },
      { value: 'ShortToLong', text: 'Short To Long' },
      { value: null, text: 'n/a' },
    ];
    bundlerRulesSub_;
    bundlerRules;
    loading = false;
    hideComplete = false;

    constructor(
      $scope: angular.IScope,
      private $http: angular.IHttpService,
      private $mdToast,
      clientDataStore: ClientDataStore,
      private $mdDialog,
    ) {
      this.bundlerRulesSub_ = clientDataStore
        .SelectBundlerRules()
        .subscribe(bundlerRule => {
          this.bundlerRules = bundlerRule;
        });

      clientDataStore
        .Selector(UserHasRoles(['administrator','job-editor'], false))
        .subscribe(userHasAdminRole => {
          this.userHasAdminRole = userHasAdminRole;
        });

      $scope.$on('$destroy', () => {
        this.bundlerRulesSub_.dispose();
      });
    }

    updateBundlerRule(
      type: string,
      customer: string,
      tooling: string,
      material: string,
      rule: IBundlingRule
    ) {
      if (!this.userHasAdminRole) {
        this.toast('You do not have permission to change this setting');
        return;
      }
      const r = { type, customer, tooling, material, rule };

      // Support entering the % value in either 0-1 or 1-100.
      // The underlying data is stored as 0-1 and a template
      // filter formats that to a nice looking %. It seems
      // like there ought to be a better way. Perhaps x-editable
      // has some options for this.
      if (rule.minPctOfMaxLength > 1)
        rule.minPctOfMaxLength = rule.minPctOfMaxLength / 100;

      this.$http
        .post(
          Ams.Config.BASE_URL +
          `/_api/integration/bundlerRules/${r.type}?customer=${r.customer}&tooling=${r.tooling}&material=${r.material}`,
          r.rule
        )
        .catch((ex: { data: { errors: string[] } }) => {
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent(ex.data.errors.reduce((x, y) => x + ' ' + y))
              .position('top right')
              .hideDelay(3000)
              .parent('#bundlerRules')
          );
        });

    }

    deleteBundlerRule(
      type: string,
      customer: string,
      tooling: string,
      material: string
    ) {
      if (!this.userHasAdminRole) {
        this.toast('You do not have permission to change this setting');
        return;
      }
      const r = { type, customer, tooling, material };
      const confirm = this.$mdDialog
        .confirm()
        .title('Delete Bundler Rule')
        .textContent('Are you sure?')
        .ok('DELETE')
        .cancel('CANCEL');

      this.$mdDialog.show(confirm).then(
        () => {
          console.log(
            `Deleting ${r.type} bundler rule for cust:${r.customer} and tool:${r.tooling} and mat:${r.material}`
          );
          //clientDataStore.Dispatch(new DeleteBundlerRule(r));
          this.$http.delete(
            Ams.Config.BASE_URL +
            `/_api/integration/bundlerRules/${r.type}?customer=${r.customer}&tooling=${r.tooling}&material=${r.material}`
          );
        },
        () => {
          console.log('Bundler rule delete action canceled');
        }
      );

    }

    addBundlerRuleDialog(type: string) {
      this.$mdDialog
        .show({
          controller: ['$mdDialog', 'type', newBundlerRuleController],
          controllerAs: 'ctrl',
          template: `<md-content layout-gt-sm="row" layout-padding>
                    <div>
                        <md-input-container ng-if="ctrl.type=='customer' || ctrl.type=='customerTooling'">
                            <label>Customer</label>
                            <input ng-model="ctrl.result.customer">
                        </md-input-container>
                        <md-input-container ng-if="ctrl.type=='materialTooling'">
                            <label>Material</label>
                            <input ng-model="ctrl.result.material">
                        </md-input-container>
                        <md-input-container ng-if="ctrl.type=='toolingDef' || ctrl.type=='customerTooling' || ctrl.type=='materialTooling'">
                            <label>Tooling</label>
                            <input ng-model="ctrl.result.tooling">
                        </md-input-container>
                    </div>
                </md-content>
                <md-button class="md-raised md-primary" ng-click="ctrl.add()">ADD</md-button>`,
          parent: angular.element(document.body),
          // targetEvent: ev,
          clickOutsideToClose: true,
          locals: {
            type: type,
          },
        })
        .then((result) => {
          this.updateBundlerRule(
            result.type,
            result.customer,
            result.tooling,
            result.material,
            {} as any
          );
        });

    }

    focusSelect(form) {
      const input = form.$editables[0].inputEl;
      setTimeout(function () {
        input.select();
      }, 0);
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
  }]
};

export default Bundling;
