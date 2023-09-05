import angular from 'angular';
import { andonDisplayDirective } from './display/andon-display.directive';
import detailModule from './detail/detail.module';
import Wallboard from './wallboard.component';

export default angular
   .module('app.wallboard', [detailModule])
   .directive('andonDisplay', andonDisplayDirective)
   .component(Wallboard.selector, Wallboard)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.wallboard', {
      url: '/settings/wallboard',
      title: '',
      views: {
         'content@app': {
            template: '<app-wallboard></app-wallboard>',
         }
      }
   });

   // Navigation
   msNavigationServiceProvider.saveItem('settings.wallboard', {
      title: 'Wallboard',
      state: 'app.wallboard',
      weight: 4,
      // claims: 'pro.wallboard',
   });
}
