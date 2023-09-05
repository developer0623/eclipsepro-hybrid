import angular from 'angular';
import TargetOeeExplorer from './target-explorer.component';

export default angular
  .module('app.explorer.target-oee', [])
  .component(TargetOeeExplorer.selector, TargetOeeExplorer)
  .config(config)
  .name;

  config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.explorer_target-oee', {
    url: '/production-explorer/target-oee',
    title: '',
    views: {
      'content@app': {
        template: '<target-oee-explorer></target-oee-explorer>',
      },
    },
  });

  // Navigation
  //         msNavigationServiceProvider.saveItem('explorer.target-oee', {
  //             title : 'targetOee',
  //             state : 'app.explorer_target-oee',
  //             weight: 5
  //         });
}
