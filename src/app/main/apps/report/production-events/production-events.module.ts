import angular from 'angular';

import ProductionEventsReport from './production-events';

export default angular
  .module('app.report.production-events', [])
  .component(ProductionEventsReport.selector, ProductionEventsReport)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_production-events', {
    url: '/report/production-events',
    title: '',
    views: {
      'content@app': {
        template: '<production-events-report></production-events-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.production-events', {
    title: 'productionEvents',
    state: 'app.report_production-events',
    weight: 10,
    claims: 'pro.machine.reports',
  });
}
