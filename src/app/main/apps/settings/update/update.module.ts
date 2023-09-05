import angular from 'angular';
import Temp from './update.html';
import UpdateSettings_ from './update.component';

export default angular
   .module('app.update', [])
   .component(UpdateSettings_.selector, UpdateSettings_)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.update', {
      url: '/settings/update',
      views: {
         'content@app': {
            template: '<update-settings></update-settings>',
         }
      }
   });
}
