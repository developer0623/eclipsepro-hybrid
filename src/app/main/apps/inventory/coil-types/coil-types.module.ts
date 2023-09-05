import angular from 'angular';
import CoilTypes from './coil-types.component';

export default angular
   .module('app.inventory.coil-types', [])
   .component(CoilTypes.selector, CoilTypes)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.inventory.coil-types', {
      url: '/inventory/coil-types',
      views: {
         'content@app': {
            template: '<coil-types></coil-types>'
         }
      }
   });

   // Navigation
   msNavigationServiceProvider.saveItem('inventory.coilTypes', {
      title: 'materials',
      state: 'app.inventory.coil-types',
      weight: 1
   });
}
