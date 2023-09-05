import angular from 'angular';
import CoilScrapReport_ from './coil-scrap-report.component';
export default angular
  .module('app.report.coil-scrap', [])
  .component(CoilScrapReport_.selector, CoilScrapReport_)
  .config(config)
  .name;

  /** @ngInject */
  config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
  function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.report_coil-scrap', {
      url: '/report/coil-scrap',
      title: '',
      views: {
        'content@app': {
          template: '<coil-scrap-report></coil-scrap-report>',
        },
      },
    });

    // Navigation
    msNavigationServiceProvider.saveItem('report.coil-scrap', {
      title: 'Coil Scrap Breakdown',
      state: 'app.report_coil-scrap',
      weight: 41,
      // claims: 'pro.machine.reports',
      badge: { content: '🧪' },
    });
  }
