import * as angular from 'angular';

import listModule from "./list/punch-pattern-list.module";
import detailModule from "./detail/punch-pattern-detail.module";

export default angular
  .module('app.punch-patterns', [
    listModule,
    detailModule
  ])
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.punch-patterns', {
    abstract: true
  });

  // Navigation
  msNavigationServiceProvider.saveItem('punch-patterns', {
    title: 'punchPatterns',
    state: 'app.punch-patterns_list',
    icon: 'mdi-stamper', //'mdi-boxing-glove mdi-flip-h', //'mdi-bullseye', //
    weight: 4,
  });
}

