
import { Ams } from '../amsconfig';
import { ClientDataStore } from '../core/services/clientData.store';
import { IUser, IPathfinderMachine } from '../core/dto';
import { UserHasRoles, UserListModel } from '../core/services/store/user/selectors';
import { Put } from "../core/services/clientData.actions";

const PathfinderUsersGrid = {
  selector: "pathfinderUsersGrid",
  template: `
        <div ng-if="$ctrl.pathfinders.length === 0">There are no connected Pathfinders.</div>
        <div ng-if="$ctrl.pathfinders.length > 0" class="settings-users">
          <table class="simple hover dataTable users-table">
            <thead>
              <tr>
                  <th></th>
                  <th>Pin</th>
                  <th ng-repeat="machine in $ctrl.pathfinders">{{machine.name}}</th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="user in $ctrl.users">
                  <td>{{user.userName}}</td>
                  <td>
                    <div editable-text="anyvariablejustnotthepin" onaftersave="$ctrl.saveUserPin(user, $data)" if-role="administrator">
                      <span ng-if="!user.folderPin" style="font-style:italic">not set
                        <md-tooltip md-direction="top">Users without a valid pin will not appear on the machine.</md-tooltip>
                      </span>
                      <span ng-if="user.folderPin">****</span>
                    </div>
                    <span if-role="administrator" if-role-hide="true">****</span>
                  </td>
                  <td ng-repeat="folder in $ctrl.pathfinders">
                      <md-select ng-model="user.folderRolesModel[folder.id]" if-role="administrator">
                          <md-option ng-repeat="role in $ctrl.pathfinderUserRolesMasterList" value="{{role}}" ng-click="$ctrl.clickedUserRole(folder, user, role)">
                              {{role}}
                          </md-option>
                      </md-select>
                      <span if-role="administrator" if-role-hide="true">{{user.folderRolesModel[folder.id]}}</span>
                  </td>
              </tr>
            </tbody>
          </table>
          <p class="small">Users must have the <code>pfpc</code> role to appear in this list.</p>
        </div>
    `,
  bindings: {},
  /** @ngInject */
  controller: ['clientDataStore', '$http', class PathfinderUsersGridComponent {
    users: IUser[];
    pathfinders: IPathfinderMachine[];
    pathfinderUserRolesMasterList: string[];
    usersSub_: Rx.IDisposable;
    userHasAdminRole = false;

    constructor(
      private clientDataStore: ClientDataStore, 
      private $http: angular.IHttpService,
      private $mdToast
    ) {
      // This takes the necessary server subscription and gets the initial data.
      // It's hacky (because we're ignoring the data) but it's the only way to
      // do it at this time.
      this.usersSub_ = clientDataStore.SelectUsers().subscribe();
      clientDataStore.SelectAll('Folders').subscribe();

      this.clientDataStore
        .Selector(UserListModel)
        .subscribe((model) => {
          this.users = model.users.filter(u => u.roles.indexOf('pfpc') > -1);
          this.pathfinderUserRolesMasterList = model.PathfinderUserRolesMasterList;
          this.pathfinders = model.pathfinders;
        });

      clientDataStore
        .Selector(UserHasRoles(['administrator', 'machine-manager'], false))
        .subscribe(userHasAdminRole => {
          this.userHasAdminRole = userHasAdminRole;
        });
    }
    clickedUserRole(machine: IPathfinderMachine, user: IUser, role: string) {
      if (!this.userHasAdminRole) {
        this.toast('You do not have permission to change this setting');
        return;
      }
      console.log(machine, user, role);
      this.$http.post(Ams.Config.BASE_URL + `/_api/folders/${machine.id}/pfpcrole?role=${role}&user=${user.userName}`, {})
        .then(result => this.clientDataStore.Dispatch(new Put('Users', result.data)));
    }
    saveUserPin(user: IUser, pin: string) {
      if (!this.userHasAdminRole) {
        this.toast('You do not have permission to change this setting');
        return;
      }
      this.$http.post(Ams.Config.BASE_URL + `/_api/users/${user.userName}/setpin?pin=${pin}`, {})
        .then(success => {
          this.clientDataStore.Dispatch(new Put('Users', success.data))
        }, error => {
          // TODO: Display an error in the editable, and refuse the save.
          console.log(error.data);
        });

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
    $onChanges() {
      console.log("users: ", this.users);
      console.log("pathfinders: ", this.pathfinders);
      console.log("pathfinderUserRoles: ", this.pathfinderUserRolesMasterList);
    }
    $onDestroy() {
      this.usersSub_.dispose();
    }
  }]
};

export default PathfinderUsersGrid;
