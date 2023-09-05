import angular from 'angular';
import ScrapSummaryReport_ from './scrap-summary-report.component';

export default angular
  .module('app.report.scrap-summary', [])
  .component(ScrapSummaryReport_.selector, ScrapSummaryReport_)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_scrap-summary', {
    url: '/report/scrap-summary',
    title: '',
    views: {
      'content@app': {
        template: '<scrap-summary-report></scrap-summary-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.scrap-summary', {
    title: 'Scrap Summary',
    state: 'app.report_scrap-summary',
    weight: 30,
    claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
