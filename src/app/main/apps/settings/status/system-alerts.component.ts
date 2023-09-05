import { IAlert } from '../../../../core/dto';

const SystemAlertsGrid = {
    selector: "systemAlertsGrid",
    template: `
        <div class="simple-table-container md-whiteframe-2dp mb-24">
            <div layout="row" class="table-title black-text" layout-align="center start">
            System Alerts
            </div>
            <div class="ms-responsive-table-wrapper">
            <table class="simple hover dataTable">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                <tr ng-repeat="alert in $ctrl.alerts">
                    <td>{{alert.title}}</td>
                    <td>{{alert.description}}</td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
    `,
    bindings: {
    alerts: "<",
    },
    controller: class SystemAlertsGridComponent {
        alerts: IAlert[] = [];
    },
};

export default SystemAlertsGrid;