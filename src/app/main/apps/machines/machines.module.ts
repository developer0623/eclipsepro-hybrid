import angular from 'angular';
import pathFinderModule from './pathfinder/pathfinder.module';
import xl200Module from './xl200/xl200.module';

export default angular
   .module('app.machines', [
      pathFinderModule,
      xl200Module
   ])
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   // Navigation
   msNavigationServiceProvider.saveItem('machines', {
      title: 'machines',
      icon: 'mdi-factory',
      weight: 7
   });
}
