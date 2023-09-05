import * as angular from 'angular';

import listModule from "./list/orders-list.module";
import detailModule from "./detail/order-detail.module";

export default angular
   .module('app.orders', [
      listModule,
      detailModule
   ])
   .config(config)
   .run(runBlock)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.orders', {
      abstract: true
   });

   // Navigation
   msNavigationServiceProvider.saveItem('orders', {
      title: 'orders',
      state: 'app.orders.list',
      icon: 'mdi-receipt',
      weight: 3,
      claims: 'pro.orders'
   });
}

/** @ngInject */
function runBlock() {
   // Orders datatable default options
   //DTDefaultOptions.setDOM('rt<\"bottom layout-row layout-align-space-between-center\"<\"flex layout-row layout-align-space-between-center\"<\"length\"l><\"layout-row layout-align-space-between-center\"<\"info\"i><\"pagination\"p>>>>');
}
