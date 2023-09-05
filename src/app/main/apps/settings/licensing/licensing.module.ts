import angular from 'angular';
import Licensing from './licensing.component';

export default angular
   .module('app.licensing', [])
   .component(Licensing.selector, Licensing)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.licensing', {
      url: '/settings/licensing',
      title: '',
      views: {
         'content@app': {
            template: '<licensing></licensing>',
         }
      }
   });

   msNavigationServiceProvider.saveItem('settings.licensing', {
      title: 'Licensing',
      state: 'app.licensing',
      weight: 5,
   });
}
