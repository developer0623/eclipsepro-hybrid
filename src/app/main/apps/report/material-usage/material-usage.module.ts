import angular from 'angular';
import MaterialUsageReport_ from './material-usage-report.component';
import { materialDateFilter } from './filter/date.filter';

export default angular
  .module('app.report.material-usage', [])
  .component(MaterialUsageReport_.selector, MaterialUsageReport_)
  .filter('maDate', materialDateFilter)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_material-usage', {
    url: '/report/material-usage',
    title: '',
    views: {
      'content@app': {
        template: '<material-usage-report></material-usage-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.material-usage', {
    title: 'Material Usage',
    state: 'app.report_material-usage',
    weight: 42,
    claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
