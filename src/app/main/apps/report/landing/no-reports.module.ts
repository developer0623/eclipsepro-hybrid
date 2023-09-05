import * as angular from 'angular';
import NoReports from './no-reports.component';

export default angular
  .module('app.report.no-reports', [])
  .config(config)
  .component(NoReports.selector, NoReports)
  .name;

/** @ngInject */
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_no-reports', {
    url: '/report/no-reports',
    title: 'Reports',
    views: {
      'content@app': {
        template: '<no-reports></no-reports>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.no-reports', {
    title: 'Get Reports',
    state: 'app.report_no-reports',
    weight: 1,
    badge: { content: 'Pro ✨' },
  });
}
