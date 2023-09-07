import angular from 'angular';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { ISystemPreferences, IUser } from '../../../../core/dto';
import { UserListModel } from '../../../../core/services/store/user/selectors';
import { Put } from "../../../../core/services/clientData.actions";
import ResetPasswordTemp from './modals/resetPassword.modal.html';
import { ResetPasswordModalController } from './modals/resetPassword.modal';

const EclipseUsersGrid = {
  selector: "eclipseUsersGrid",
  bindings: {},
  template: `
    <div class="settings-users">
        <div class="content" ng-class="$ctrl.userIsAdmin ? '' : 'disabled'">
            <md-checkbox class="md-primary" ng-model="$ctrl.systemPreferences.allowGuestUser" ng-change="$ctrl.setAllowGuestUser()"></md-checkbox>
            <span class="allow-guest-user" translate="AllowGuestUser"></span>
            <md-tooltip ng-if="!$ctrl.userIsAdmin" md-direction="top">
                <span translate="AdministratorRequiredToAllowGuestUser"></span>
            </md-tooltip>
        </div>
        <table class="simple hover dataTable users-table">
        <thead>
            <tr>
            <th>User Name</th>
            <th>Roles</th>
            <th class="users-table-actions">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr ng-repeat="user in $ctrl.users">
            <td>
              <a ui-sref="app.user({userName: user.userName})">{{user.userName}}</a>
            </td>
            <td>
                <span ng-repeat="role in user.roles">
                    {{role}} <br/>
                </span>
            </td>
            <td>
                <md-menu if-role="administrator">
                <md-button class="md-icon-button" ng-click="$mdMenu.open($event);$ctrl.onUserMenuOpen()">
                    <md-icon md-menu-origin md-font-icon="mdi-dots-vertical" class="mdi"></md-icon>
                </md-button>
                <md-menu-content width="4">
                    <md-menu-item>
                    <md-button ng-click="$ctrl.onOpenResetModal(user)" aria-label="Reset Password">
                        Reset Password
                    </md-button>
                    </md-menu-item>
                    <md-menu-divider></md-menu-divider>
                    <md-menu-item ng-repeat="role in user.rolesModel">
                    <md-checkbox ng-checked="role.enabled" ng-click="$ctrl.toggleRole(user, role)">
                        {{role.roleName}}
                    </md-checkbox>
                    </md-menu-item>
                </md-menu-content>
                </md-menu>
            </td>
            </tr>
        </tbody>
        </table>
    </div>
    `,
  /** @ngInject */
  controller: ['$mdDialog', '$mdToast', 'clientDataStore', 'api', '$scope', class EclipseUsersGridComponent {
    loading = false;
    users: IUser[] = [];
    systemPreferences: ISystemPreferences;
    userIsAdmin: boolean;
    usersSub_: Rx.IDisposable;
    isEditing: boolean = false;
    constructor(
      private $mdDialog,
      private $mdToast,
      private clientDataStore: ClientDataStore,
      private api,
      private $scope
    ) {
      // This takes the necessary server subscription and gets the initial data.
      // It's hacky (because we're ignoring the data) but it's the only way to
      // do it at this time.
      this.usersSub_ = clientDataStore.SelectUsers().subscribe();

      clientDataStore.Selector(UserListModel).subscribe((model) => {
        console.log(model);
        if (!this.isEditing) {
          // SignalR updates will cause the edit menu to close, so only update the model when we are not editing.
          // We might want to hold onto the updated data and update the model when the menu closes.
          this.users = model.users;
        }
        this.systemPreferences = model.systemPreferences;
        this.userIsAdmin = model.userIsAdmin;
      });

      $scope.$on("$mdMenuClose", () =>{ this.onUserMenuClose(); });
    }
    onUserMenuOpen(){
      console.log('onUserMenuOpen');
      this.isEditing = true;
    }
    onUserMenuClose(){
      console.log('onUserMenuClose');
      this.isEditing = false;
    }
    toggleRole(user: IUser, role: { roleName: string, enabled: boolean }) {
      const onUserUpdateSuccess = (data) =>
        this.clientDataStore.Dispatch(new Put<IUser>("Users", data));
      const onUserUpdateError = (response) =>
        this.$mdToast.show(
          this.$mdToast
            .simple()
            .textContent(response.data.errors.join(" "))
            .position("top right")
            .hideDelay(2000)
        );

      if (role.enabled)
        this.api.users.removerole(
          { username: user.userName, role: role.roleName },
          null,
          onUserUpdateSuccess,
          onUserUpdateError
        );
      else
        this.api.users.addrole(
          { username: user.userName, role: role.roleName },
          null,
          onUserUpdateSuccess,
          onUserUpdateError
        );
    }

    onOpenResetModal(user: IUser) {
      this.$mdDialog
        .show({
          parent: angular.element(document.body),
          template: ResetPasswordTemp,
          controller: ResetPasswordModalController,
          clickOutsideToClose: true,
          controllerAs: "vm",
          locals: {
            user,
          },
        })
        .then((result) => {
          if (result.isSuccess) {
            this.$mdToast.show(
              this.$mdToast
                .simple()
                .textContent("Password reset successfully!")
                .position("top right")
                .hideDelay(2000)
            );
          }
        });
    }

    $onDestroy() {
      this.usersSub_.dispose();
    }

    setAllowGuestUser() {
      this.api.systemPreferences.save({
        allowGuestUser: this.systemPreferences.allowGuestUser,
      });
    }
  }],
};

export default EclipseUsersGrid;
