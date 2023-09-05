import angular from 'angular';
import ScrapExplorer from './scrap-explorer.component';

export default angular
  .module('app.explorer.scrap', [])
  .component(ScrapExplorer.selector, ScrapExplorer)
  .config(config)
  .name;

  config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_explorer_scrap', {
    url: '/production-explorer/scrap',
    // claims: 'pro.machine.reports.explorers',
    title: '',
    views: {
      'content@app': {
        template: '<scrap-explorer></scrap-explorer>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.explorer-scrap', {
    title: 'scrapExplorer',
    state: 'app.report_explorer_scrap',
    // claims: 'pro.machine.reports.explorers',
    weight: 31,
  });
}
