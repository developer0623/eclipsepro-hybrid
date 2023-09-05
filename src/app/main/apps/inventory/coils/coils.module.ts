import angular from 'angular';
import AppCoils from './coils.component';

export default angular
   .module('app.inventory.coils', [])
   .component(AppCoils.selector, AppCoils)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.inventory.coils', {
      url: '/inventory/coils',
      views: {
         'content@app': {
            template: '<app-coils></app-coils>'
         }
      }
   });

   // Navigation
   msNavigationServiceProvider.saveItem('inventory.coils', {
      title: 'coils',
      state: 'app.inventory.coils',
      weight: 2
   });
}
