import angular from 'angular';
import OrderSummaryReport_ from './order-summary.component';

export default angular
  .module('app.report.order-summary', [])
  .config(config)
  .component(OrderSummaryReport_.selector, OrderSummaryReport_)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_order-summary', {
    url: '/report/order-summary',
    title: '',
    views: {
      'content@app': {
        template: '<order-summary-report></order-summary-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.order-summary', {
    title: 'Order Summary',
    state: 'app.report_order-summary',
    weight: 45,
    claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
