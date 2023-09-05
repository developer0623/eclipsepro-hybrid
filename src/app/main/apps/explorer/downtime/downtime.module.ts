import angular from 'angular';
import DowntimeExplorer from './downtime-explorer.component';

export default angular
  .module('app.explorer.downtime', [])
  .component(DowntimeExplorer.selector, DowntimeExplorer)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_explorer_downtime', {
    url: '/production-explorer/downtime',
    // claims: 'pro.machine.reports.explorers',
    title: '',
    views: {
      'content@app': {
        template: '<downtime-explorer></downtime-explorer>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.explorer-downtime', {
    title: 'downtimeExplorer',
    state: 'app.report_explorer_downtime',
    // claims: 'pro.machine.reports.explorers',
    weight: 21,
  });
}
