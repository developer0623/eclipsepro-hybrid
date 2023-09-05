import angular from 'angular';
import CoilSummaryReport_ from './coil-summary-report.component';

export default angular
  .module('app.report.coil-summary', [])
  .component(CoilSummaryReport_.selector, CoilSummaryReport_)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_coil-summary', {
    url: '/report/coil-summary',
    title: '',
    views: {
      'content@app': {
        template: '<coil-summary-report></coil-summary-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.coil-summary', {
    title: 'Coil Summary',
    state: 'app.report_coil-summary',
    weight: 40,
    // claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
