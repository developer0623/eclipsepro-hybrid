import angular from 'angular';
import PatternList from './punch-pattern-list.component';
export default angular
  .module('app.punch-patterns.list', [])
  .component(PatternList.selector, PatternList)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.punch-patterns_list', {
    url: '/punch-patterns',
    title: '',
    views: {
      'content@app': {
        template: '<punch-patterns-list></punch-patterns-list>',
      },
    },
  });
}
