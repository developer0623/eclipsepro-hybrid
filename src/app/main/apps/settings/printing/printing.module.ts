import angular from 'angular';
import Temp from './printing.html';
import Printing from './printing.component';
import PrintingPreview from './printing-preview.component';
import { customInputDirective } from './custom-input.directive';

export default angular
    .module('app.printing', [])
    .component(Printing.selector, Printing)
    .component(PrintingPreview.selector, PrintingPreview)
    .directive('customFile', customInputDirective as any)
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.printing', {
        url: '/settings/printing?tab',
        views: {
            'content@app': {
                template: '<printing></printing>',
            }
        }
    });

    $stateProvider.state('app.printing-preview', {
        url: '/settings/printing-preview?template',
        views: {
            'content@app': {
                template: '<printing-preview></printing-preview>',
            }
        }
    });

    // Navigation
    msNavigationServiceProvider.saveItem('settings.printing', {
        title: 'Printing',
        state: 'app.printing',
        weight: 5,
        claims: 'pro.printing'
    });
}
