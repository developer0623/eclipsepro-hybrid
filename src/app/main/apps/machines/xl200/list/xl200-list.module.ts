import angular from 'angular';
import XL200List from './xl200-list.component';
import AddXl200Modal from '../new/new-xl200-modal.component';

export default angular
  .module('app.machines.xl200.list', [])
  .component(XL200List.selector, XL200List)
  .component(AddXl200Modal.selector, AddXl200Modal)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.machines_xl200', {
    url: '/machines/xl200',
    title: '',
    views: {
      'content@app': {
        template: '<xl-list></xl-list>',
      },
    },
  });
  msNavigationServiceProvider.saveItem('machines.xl200', {
    title: 'XL200',
    state: 'app.machines_xl200',
    weight: 2,
  });
}
