import angular from 'angular';
import OrderSequenceReport_ from './order-sequence.component';

export default angular
  .module('app.report.order-sequence', [])
  .config(config)
  .component(OrderSequenceReport_.selector, OrderSequenceReport_)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_order-sequence', {
    url: '/report/order-sequence?machines',
    title: '',
    views: {
      'content@app': {
        template: '<order-sequence-report></order-sequence-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.order-sequence', {
    title: 'Order Sequence',
    state: 'app.report_order-sequence',
    weight: 46,
    claims: 'pro.machine.reports',
  });
}
