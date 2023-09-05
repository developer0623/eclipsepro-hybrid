import angular from 'angular';
import Machines_ from './machines.component';

export default angular
  .module('app.dashboards.machines.machines', [])
  .component(Machines_.selector, Machines_)
  .config(config)
  .name;

  config.$inject = ['$stateProvider', '$translatePartialLoaderProvider', 'msNavigationServiceProvider']
function config(
  $stateProvider,
  $translatePartialLoaderProvider,
  msNavigationServiceProvider
) {
  $stateProvider.state('app.dashboards_machines_machines', {
    url: '/dashboards/machines',
    title: '',
    views: {
      'content@app': {
        template: '<machines></machines>',
      },
    },
  });
  $translatePartialLoaderProvider.addPart('app/main/apps/dashboards');

  // Navigation
  msNavigationServiceProvider.saveItem('dashboards.machines', {
    title: 'machines',
    state: 'app.dashboards_machines_machines',
    weight: 1,
  });
}
