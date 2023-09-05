import angular from 'angular';
import Pathfinder from './pathfinder.component';

export default angular
   .module('app.machines.pathfinder', [])
   .component(Pathfinder.selector, Pathfinder)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {

   $stateProvider.state('app.machines_pathfinder', {
      url: '/machines/pathfinder',
      claims: 'pro.machine.dashboard',
      title: '',
      views: {
         'content@app': {
            template: '<path-finder></path-finder>'
         }
      }
   });

   // Navigation
   msNavigationServiceProvider.saveItem('machines.pathfinder', {
      title: 'Pathfinder',
      state: 'app.machines_pathfinder',
      weight: 1,
      claims: 'pro.machine.dashboard',
   });
}
