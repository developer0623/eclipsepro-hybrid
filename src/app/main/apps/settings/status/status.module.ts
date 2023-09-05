import angular from 'angular';
import StatusView from './status-view.component';
import PendingActionsToAgentGrid from './pending-actions-to-agent.component';
import ServiceHealthGrid from './service-health.component';
import SyncStateGrid from './sync-state-grid.component';
import SystemAlertsGrid from './system-alerts.component';
import ExpressSparkline from './express-sparkline.component';
import ExpressView from './express-view.component';

export default angular
    .module('app.status', [])
    .config(config)
    .component(ServiceHealthGrid.selector, ServiceHealthGrid)
    .component(StatusView.selector, StatusView)
    .component(PendingActionsToAgentGrid.selector, PendingActionsToAgentGrid)
    .component(SyncStateGrid.selector, SyncStateGrid)
    .component(SystemAlertsGrid.selector, SystemAlertsGrid)
    .component(ExpressView.selector, ExpressView)
    .component(ExpressSparkline.selector, ExpressSparkline)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.status', {
        url: '/settings/status',
        views: {
            'content@app': {
                template: '<status-view></status-view>'
            }
        }
    });

    // Navigation
    msNavigationServiceProvider.saveItem('settings.status', {
        title: 'System Health',
        state: 'app.status',
        weight: 7,
    });
}
