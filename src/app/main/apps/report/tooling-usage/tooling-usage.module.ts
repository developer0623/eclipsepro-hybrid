import angular from 'angular';
import ToolingUsageReport_ from './tooling-usage-report.component';
import { materialDateFilter } from '../material-usage/filter/date.filter';

export default angular
  .module('app.report.tooling-usage', [])
  .component(ToolingUsageReport_.selector, ToolingUsageReport_)
  .filter('maDate', materialDateFilter)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_tooling-usage', {
    url: '/report/tooling-usage',
    title: '',
    views: {
      'content@app': {
        template: '<tooling-usage-report></tooling-usage-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.tooling-usage', {
    title: 'Tooling Code Usage',
    state: 'app.report_tooling-usage',
    weight: 42,
    claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
