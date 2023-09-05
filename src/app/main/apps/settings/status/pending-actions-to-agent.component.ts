import { IPendingActionsToAgent } from '../../../../core/dto';

const PendingActionsToAgentGrid = {
  selector: "pendingActionsToAgentGrid",
  template: `
          <div class="simple-table-container md-whiteframe-2dp mb-24">
            <div layout="row" class="table-title black-text" layout-align="center start">
              Pending Actions to Agent
            </div>
            <div class="ms-responsive-table-wrapper">
              <table class="simple hover dataTable">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  <tr ng-repeat="actionInfo in $ctrl.pendingAgentActions">
                    <td>{{actionInfo.type}}</td>
                    <td>{{actionInfo.count}}</td>                        
                  </tr>
                </tbody>
              </table>
            </div>
          </div>   
    `,
  bindings: {
    pendingAgentActions: "<",
  },
  controller: class PendingActionsToAgentGridComponent {
    pendingAgentActions: IPendingActionsToAgent[] = [];
  },
};

export default PendingActionsToAgentGrid;