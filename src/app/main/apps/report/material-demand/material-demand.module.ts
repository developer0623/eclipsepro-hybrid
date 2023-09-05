import angular from 'angular';
import MaterialDemandReport_ from './material-demand-report.component';

export default angular.module('app.report.material-demand', [])
  .component(MaterialDemandReport_.selector, MaterialDemandReport_)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_material-demand', {
    url: '/report/material-demand',
    title: '',
    views: {
      'content@app': {
        template: '<material-demand-report></material-demand-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.material-demand', {
    title: 'Material Demand',
    state: 'app.report_material-demand',
    weight: 43,
    claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
