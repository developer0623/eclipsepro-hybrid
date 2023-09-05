import angular from 'angular';
import PathfinderOperationsExplorer from './pathfinder-operations.component';

export default angular
  .module('app.explorer.pathfinder-operations', [])
  .component(
    PathfinderOperationsExplorer.selector,
    PathfinderOperationsExplorer
  )
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_explorer_operations_pathfinder', {
    url: '/production-explorer/pathfinder-operations',
    claims: 'pro.machine.reports.explorers',
    title: '',
    views: {
      'content@app': {
        template:
          '<pathfinder-operations-explorer></pathfinder-operations-explorer>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem(
    'report.explorer-pathfinder-operations',
    {
      title: 'Pathfinder Operations Explorer',
      state: 'app.report_explorer_operations_pathfinder',
      claims: 'pro.machine.reports.explorers',
      featureFlag: 'experimental',
      badge: { content: '🧪' },
      weight: 61,
    }
  );
}
