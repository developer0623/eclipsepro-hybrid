import angular from 'angular';
import Experiments from './experiments.component';

export default angular
    .module('app.experiments', [])
    .component(Experiments.selector, Experiments)
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.experiments', {
        url: '/settings/experiments',
        views: {
            'content@app': {
                template: '<experiments></experiments>'
            }
        }
    });
}
