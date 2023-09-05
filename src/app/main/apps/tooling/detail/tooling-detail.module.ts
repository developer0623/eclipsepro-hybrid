import angular from 'angular';
import ToolingDetail from './tooling-detail.component';
import AddMachineModal from './addMachineModal/addMachineModal.component';
export default angular
  .module('app.tooling.detail', [])
  .component(ToolingDetail.selector, ToolingDetail)
  .component(AddMachineModal.selector, AddMachineModal)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.tooling_detail', {
    url: '/tooling/{id}',
    title: '',
    views: {
      'content@app': {
        template: '<tooling-detail></tooling-detail>',
      },
    },
  });
}
