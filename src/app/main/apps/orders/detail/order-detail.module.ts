import angular from 'angular';
import 'angular-slick-carousel';
import OrderDetailComponent from './order-detail.component';
import BundleItem from './components/bundle-item.component';
import OrderProgress from './components/order-progress.component';
import SplitModal_ from './components/split-dialog/split-modal.component';
import ItemPattern from './components/item-pattern.component';

export default angular
    .module('app.orders.detail', ['slickCarousel'])
    .component(OrderDetailComponent.selector, OrderDetailComponent)
    .component(BundleItem.selector, BundleItem)
    .component(OrderProgress.selector, OrderProgress)
    .component(ItemPattern.selector, ItemPattern)
    .component(SplitModal_.selector, SplitModal_)
    .config(config)
    .config(['slickCarouselConfig', function (slickCarouselConfig) {
        slickCarouselConfig.dots = false;
        slickCarouselConfig.autoplay = false;
    }])
    .name;

/** @ngInject */
config.$inject = ['$stateProvider']
function config($stateProvider) {
    $stateProvider.state('app.orders.detail', {
        url: '/orders/{id}',
        views: {
            'content@app': {
                template: '<order-detail-view></order-detail-view>'
            }
        }
    });
}

