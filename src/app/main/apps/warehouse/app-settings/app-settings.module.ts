import angular from 'angular';
import Temp from './app-settings.html';
import { AppSettingsController } from './app-settings.controller';

export default angular
   .module('app.warehouse.app-settings', [

   ]).config(config)
   .name;



/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.warehouse_settings', {
      url: '/warehouse/app-settings',
      claims: 'pro.machine.warehouse',
      title: '',
      views: {
         'content@app': {
            template: Temp,
            controller: AppSettingsController,
            controllerAs: 'vm'
         }
      }
   });

   // Navigation
   msNavigationServiceProvider.saveItem('warehouse.app-settings', {
      title: 'App Settings',
      state: 'app.warehouse_settings',
      claims: 'pro.machine.warehouse',
      weight: 3
   });
}
