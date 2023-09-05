import angular from 'angular';

import PerformanceStandards_ from './performance-standards.component';
import componentsModule from './components/tableContent';
import { performanceTooltip } from './directives/performance-tooltip.directive';

export default angular
    .module('app.performance-standards', [
        componentsModule
    ])
    .component(PerformanceStandards_.selector, PerformanceStandards_)
    .directive('performanceTooltip', performanceTooltip)
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.performance-standards', {
        url: '/settings/performancestandards',
        views: {
            'content@app': {
                template: '<performance-standards></performance-standards>'
            }
        }
    });

    // Navigation
    msNavigationServiceProvider.saveItem('settings.performance-standards', {
        title: 'Performance Standards',
        state: 'app.performance-standards',
        weight: 3,
        // claims: 'pro.machine.licensed'
    });
}
