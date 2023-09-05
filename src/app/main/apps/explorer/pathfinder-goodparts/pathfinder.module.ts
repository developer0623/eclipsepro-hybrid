import angular from 'angular';
import PathfinderGoodPartsExplorer from './pathfinder-explorer.component';

export default angular
  .module('app.explorer.pathfinder-goodparts', [])
  .component(
    PathfinderGoodPartsExplorer.selector,
    PathfinderGoodPartsExplorer
  )
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_explorer_goodparts_pathfinder', {
    url: '/production-explorer/pathfinder-goodparts',
    // claims: 'pro.machine.reports.explorers',
    title: '',
    views: {
      'content@app': {
        template:
          '<pathfinder-goodparts-explorer></pathfinder-goodparts-explorer>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem(
    'report.explorer-pathfinder-goodparts',
    {
      title: 'Pathfinder Good Parts Explorer',
      state: 'app.report_explorer_goodparts_pathfinder',
      // claims: 'pro.machine.reports.explorers',
      badge: { content: '🧪' },
      featureFlag: 'experimental',
      weight: 62,
    }
  );
}
