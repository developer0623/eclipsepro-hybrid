import angular from 'angular';
import Temp from './system-preferences.html';
import SystemPreferences_ from './system-preferences.component';

export default angular
    .module('app.system-preferences', [])
    .component(SystemPreferences_.selector, SystemPreferences_)
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.system-preferences', {
        url: '/settings/system-preferences',
        views: {
            'content@app': {
                template: '<system-preferences></system-preferences>',
            }
        }
    });

    // Navigation
    msNavigationServiceProvider.saveItem('settings.system-preferences', {
        title: 'systemPreferences',
        state: 'app.system-preferences',
        weight: 1
    });

    // $translatePartialLoaderProvider.addPart('app/main/apps/settings/system-preferences');

}
