import { module } from 'angular';
import ToolbarComponent from './toolbar.component';

config.$inject = ['$translatePartialLoaderProvider']
/** @ngInject */
function config($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('app/toolbar');
}

export default module('app.toolbar', [])
    .component(ToolbarComponent.selector, ToolbarComponent)
    .config(['$translatePartialLoaderProvider', config])
    .name;



