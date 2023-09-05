import * as angular from 'angular';

import listModule from "./list/tooling-list.module";
import detailModule from "./detail/tooling-detail.module";

export default angular
  .module('app.tooling', [
    listModule,
    detailModule
  ])
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.tooling', {
    abstract: true
  });

  // Navigation
  msNavigationServiceProvider.saveItem('tooling', {
    title: 'tooling',
    state: 'app.tooling_list',
    icon: 'mdi-hammer-wrench',
    //icon: 'icon-receipt',
    weight: 8,
  });
}

