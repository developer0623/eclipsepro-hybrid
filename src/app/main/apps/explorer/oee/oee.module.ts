import angular from 'angular';
import OeeExplorer from './oee-explorer.component';

export default angular
  .module('app.explorer.oee', [])
  .component(OeeExplorer.selector, OeeExplorer)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {

  $stateProvider.state('app.explorer_oee', {
    url: '/production-explorer/oee',
    title: '',
    views: {
      'content@app': {
        template: '<oee-explorer></oee-explorer>',
      }
    },
  });

  // Navigation
  //        msNavigationServiceProvider.saveItem('explorer.oee', {
  //           title : 'oEE',
  //           state : 'app.explorer_oee',
  //           weight: 3
  //        });
}
