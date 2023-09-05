import angular from 'angular';
import CoilDetails from './coil-details.component';

export default angular
   .module('app.inventory.coil', [])
   .component(CoilDetails.selector, CoilDetails)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider']
function config($stateProvider) {
   $stateProvider.state('app.inventory.coils.coil', {
      url: '/:id',
      views: {
         'content@app': {
            template: '<coil-details></coil-details>',
         }
      }
   });
}
