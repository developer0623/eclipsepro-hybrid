import { ISyncState } from '../../../../core/dto';
import { Ams } from '../../../../amsconfig';

const SyncStateGrid = {
    selector: 'syncStateGrid',
    template: `
          <div class="simple-table-container md-whiteframe-2dp mb-24">
            <div layout="row" class="table-title black-text" layout-align="center start">
              Sync State
            </div>
            <div class="ms-responsive-table-wrapper">
              <table class="simple hover dataTable">
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Updates</th>
                    <th>Deletes</th>
                    <th>Last Sync</th>
                    <th>Changes/minute</th>
                    <th>Deletes/minute</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr ng-repeat="syncState in $ctrl.syncState">
                    <td>{{syncState.id}}</td>
                    <td>{{syncState.updatesCount}}</td>
                    <td>{{syncState.deletesCount}}</td>
                    <td>{{syncState.lastSyncTime | amsDateTime}}</td>
                    <td>{{syncState.updatesPerMin | number:2}}</td>
                    <td>{{syncState.deletesPerMin | number:2}}</td>
                    <td>
                      <md-button ng-click="$ctrl.triggerSync(syncState.id)" class="md-icon-button">
                        <md-icon md-font-icon="mdi-refresh" class="mdi"></md-icon>
                      </md-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
    `,
    bindings: {
      syncState: "<"
    },
    controller: ['$http', class SyncStateGridComponent {
      syncState: ISyncState[] = [];

      constructor(
        private $http: ng.IHttpService
      ) {}

      triggerSync(doc: string) {
        this.$http.post(Ams.Config.BASE_URL + `/api/system/forceAgentSync/${doc.slice(10)}`, {});
     }
    }]
};

export default SyncStateGrid;
