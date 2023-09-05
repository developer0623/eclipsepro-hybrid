import angular from 'angular';
import DowntimeSummaryReport_ from './downtime-summary-report.component';

export default angular
  .module('app.report.downtime-summary', [])
  .component(DowntimeSummaryReport_.selector, DowntimeSummaryReport_)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_downtime-summary', {
    url: '/report/downtime-summary',
    title: '',
    views: {
      'content@app': {
        template: '<downtime-summary-report></downtime-summary-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.downtime-summary', {
    title: 'Downtime Summary',
    state: 'app.report_downtime-summary',
    weight: 20,
    // claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
