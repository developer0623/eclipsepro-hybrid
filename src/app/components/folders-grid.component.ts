import { Put } from "../core/services/clientData.actions";
import { ClientDataStore } from '../core/services/clientData.store';
import { IPathfinderMachine } from '../core/dto';
import { Ams } from '../amsconfig';
import { UserHasRoles } from '../core/services/store/user/selectors';

const FoldersGrid = {
  selector: "foldersGrid",
  template: `
        <div ng-if="$ctrl.pathfinders.length === 0">There are no connected Pathfinders.</div>
        <div class="settings-users">
          <table ng-if="$ctrl.pathfinders.length > 0" class="simple hover dataTable users-table">
            <thead>
              <tr>
                  <th>Folding Machines</th>
                  <th>Serial Number</th>
                  <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="folder in $ctrl.pathfinders">
                  <td>
                    <div editable-text="folder.name" onaftersave="$ctrl.saveFolderNameChange(folder, $data)">{{folder.name}}</div>
                  </td>
                  <td>{{folder.serialNumber}}</td>
                  <td>
                    <md-button class="m-0" ng-if="!folder.accepted" ng-click="$ctrl.acceptFolder(folder)">Accept</md-button>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>

  `,
  bindings: {},
  /** @ngInject */
  controller: ['clientDataStore', '$http', class FoldersGridComponent {
    pathfinders: IPathfinderMachine[] = [];
    userHasAdminRole = false;

    constructor(
      private clientDataStore: ClientDataStore, 
      private $http: angular.IHttpService,
      private $mdToast
    ) {
      this.clientDataStore
        .Selector((state) => state.Folders)
        .subscribe((folders) => {
          console.log(folders);
          this.pathfinders = folders;
        });

      clientDataStore
        .Selector(UserHasRoles(['administrator', 'machine-manager'], false))
        .subscribe(userHasAdminRole => {
          this.userHasAdminRole = userHasAdminRole;
        });
    }
    acceptFolder(folder: IPathfinderMachine) {
      if (!this.userHasAdminRole) {
        this.toast('You do not have permission to change this setting');
        return;
      }
      this.$http.post<IPathfinderMachine>(Ams.Config.BASE_URL + `/_api/folders/${folder.id}/accept`, {})
        .then(response => {
          this.clientDataStore.Dispatch(new Put('Folders', response.data))
        })
    }
    saveFolderNameChange(folder: IPathfinderMachine, newname: string) {
      if (!this.userHasAdminRole) {
        this.toast('You do not have permission to change this setting');
        return;
      }
      console.log(newname);
      console.log(folder);
      this.$http.patch<IPathfinderMachine>(Ams.Config.BASE_URL + `/_api/folders/${folder.id}`, { name: newname })
        .then(response => {
          this.clientDataStore.Dispatch(new Put('Folders', response.data))
        })
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
  }],
};

export default FoldersGrid;
