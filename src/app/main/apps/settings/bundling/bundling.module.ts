import angular from 'angular';
import Bundling from './bundling.component';

export default angular
  .module('app.bundling', [])
  .component(Bundling.selector, Bundling)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.bundling', {
    url: '/settings/bundling',
    title: '',
    views: {
      'content@app': {
        template: '<bundling></bundling>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('settings.bundling', {
    title: 'Bundling',
    state: 'app.bundling',
    weight: 5,
    claims: 'pro.machine.licensed',
  });
}
