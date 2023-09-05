import angular from 'angular';
import GoodProductionExplorer from './good-production-explorer.component';

export default angular
  .module('app.explorer.good-production', [])
  .component(GoodProductionExplorer.selector, GoodProductionExplorer)
  .config(config)
  .name;
  config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_explorer_good-production', {
    url: '/production-explorer/good-production',
    // claims: 'pro.machine.reports.explorers',
    title: '',
    views: {
      'content@app': {
        template: '<good-production-explorer></good-production-explorer>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.explorer-good-production', {
    title: 'goodProductionExplorer',
    state: 'app.report_explorer_good-production',
    // claims: 'pro.machine.reports.explorers',
    weight: 11,
  });
}
