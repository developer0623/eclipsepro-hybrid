import angular from 'angular';
import Temp from './tasks.html';
import { TasksController } from './tasks.controller';

export default angular
   .module('app.warehouse.tasks', [

   ]).config(config)
   .name;



/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {

   $stateProvider.state('app.warehouse_tasks', {
      url: '/warehouse/tasks',
      claims: 'pro.machine.warehouse',
      title: '',
      views: {
         'content@app': {
            template: Temp,
            controller: TasksController,
            controllerAs: 'vm'
         }
      }
   });

   // Navigation
   msNavigationServiceProvider.saveItem('warehouse.tasks', {
      title: 'Tasks',
      state: 'app.warehouse_tasks',
      weight: 1,
      claims: 'pro.machine.warehouse',
   });
}
