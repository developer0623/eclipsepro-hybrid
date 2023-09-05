import angular from 'angular';
import detailModule from './detail/xl200-detail.module';
import listModule from './list/xl200-list.module';

export default angular
   .module('app.machines.xl200', [
      detailModule,
      listModule
   ]).config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {


}
