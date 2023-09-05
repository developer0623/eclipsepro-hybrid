import angular from 'angular';
import CoilType from './coil-type.component';

export default angular
   .module('app.inventory.coil-type', [])
   .component(CoilType.selector, CoilType)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider']
function config($stateProvider) {
   $stateProvider.state('app.inventory.coil-types.coil-type', {
      url: '/:id',
      views: {
         'content@app': {
            template: '<coil-type></coil-type>',
         }
      }
   });
}
