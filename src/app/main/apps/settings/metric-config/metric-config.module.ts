import angular from 'angular';
import { IApiResolverService } from '../../../../reference';
import MetricConfig from './metric-config.component';

export default angular
    .module('app.metric-config', [])
    .component(MetricConfig.selector, MetricConfig)
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.metric-config', {
        url: '/settings/metric-config',
        views: {
            'content@app': {
                template: '<metric-config></metric-config>'
            }
        },
        // resolve: {
        //     MetricDefinitions: function (apiResolver: IApiResolverService) {
        //         return apiResolver.resolve('metricDefs@get');
        //     }
        // }
    });

    // Navigation
    msNavigationServiceProvider.saveItem('settings.metric-config', {
        title: 'metricConfiguration',
        state: 'app.metric-config',
        weight: 2,
        claims: 'pro.machine.licensed'
    });
}
