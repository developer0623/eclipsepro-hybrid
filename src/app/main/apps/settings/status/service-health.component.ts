import { IHealth, HealthSummaryType } from '../../../../core/dto';

const ServiceHealthGrid = {
  selector: "serviceHealthGrid",
  template: `
          <div class="simple-table-container md-whiteframe-2dp mb-24">
            <div layout="row" class="table-title black-text" layout-align="center start">
              Service Health
            </div>
            <span ng-repeat="summary in $ctrl.healthSummary">
              {{summary.collection}}: {{summary.count}}
            </span>
            <div class="ms-responsive-table-wrapper">
              <table class="simple hover dataTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  <tr ng-repeat="health in $ctrl.healths">
                    <td>{{health.serviceName}}</td>
                    <td>{{health.status}}</td>
                    <td>
                      <ul>
                        <li ng-repeat="error in health.errors">{{error}}</li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
   `,
  bindings: {
    healths: "<",
    healthSummary: "<"
  },
  controller: class ServiceHealthGridComponent {
    healths: IHealth[] = [];
    healthSummary: HealthSummaryType[] = [];
    constructor() { }
  },
};

export default ServiceHealthGrid;