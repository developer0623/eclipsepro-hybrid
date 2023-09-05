import angular from 'angular';
import ToolingList from './tooling-list.component';
import AddToolingModal from './addToolingModal/addToolingModal.component';
export default angular
  .module('app.tooling.list', [])
  .component(ToolingList.selector, ToolingList)
  .component(AddToolingModal.selector, AddToolingModal)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.tooling_list', {
    url: '/tooling',
    title: '',
    views: {
      'content@app': {
        template: '<tooling-list></tooling-list>',
      },
    },
  });
}
