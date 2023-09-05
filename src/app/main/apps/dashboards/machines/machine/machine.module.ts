import * as angular from 'angular';
import Machine_ from './machine.component';

export default angular
  .module('app.dashboards.machines.machine', [])
  .component(Machine_.selector, Machine_)
  .config(config)
  .name;

  config.$inject = ['$stateProvider']
function config($stateProvider) {
  $stateProvider.state('app.dashboards_machines_machine', {
    url: '/dashboards/machines/:id',
    params: {
      id: {
        dynamic: true
      }
    },
    views: {
      'content@app': {
        template: '<machine></machine>'
      }
    },
    claims: 'pro.machine.dashboard',
    reloadOnSearch: false,
    resolve: {
      MetricDefinitions: ['apiResolver', function (apiResolver) {
        return apiResolver.resolve('metricDefs@get');
      }]
    }
  });
}
