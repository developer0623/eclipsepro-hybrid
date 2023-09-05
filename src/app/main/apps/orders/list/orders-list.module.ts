import angular from 'angular';
import OrderList from './orders-list.component';

export default angular
   .module('app.orders.list', [])
   .component(OrderList.selector, OrderList)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.orders.list', {
      url: '/orders',
      views: {
         'content@app': {
            template: '<order-list></order-list>'
         }
      }
   });
}
