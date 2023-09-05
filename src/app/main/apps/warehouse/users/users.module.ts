import angular from 'angular';
import Temp from './users.html';
import { WarehouseUsersController } from './users.controller';

export default angular
   .module('app.warehouse.users', [])
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.warehouse_users', {
      url: '/warehouse/users',
      claims: 'pro.machine.warehouse',
      title: '',
      views: {
         'content@app': {
            template: Temp,
            controller: WarehouseUsersController,
            controllerAs: 'vm'
         }
      }
   });

   // Navigation
   msNavigationServiceProvider.saveItem('warehouse.users', {
      title: 'Users',
      state: 'app.warehouse_users',
      weight: 2,
      claims: 'pro.machine.warehouse',
   });
}
