import angular from 'angular';
import XL200Detail from './xl200-detail.component';
import XL200LockoutItem from './xl200-lockout-item.component';
import XL200Setups from './xl200-setups.component';
import XL200Tools from './xl200-tools.component';

export default angular
  .module('app.machines.xl200.detail', [])
  .component(XL200Detail.selector, XL200Detail)
  .component(XL200LockoutItem.selector, XL200LockoutItem)
  .component(XL200Setups.selector, XL200Setups)
  .component(XL200Tools.selector, XL200Tools)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider']
function config($stateProvider) {
  $stateProvider.state('app.machines_xl200_detail', {
    url: '/machines/xl200/{id}',
    title: '',
    views: {
      'content@app': {
        template: '<xl-detail></xl-detail>',
      },
    },
  });
}
