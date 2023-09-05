import angular from 'angular';

import EclipseUsersGrid from './eclipse-users-grid.component';
import UsersSettings_ from './users.component';

export default angular
    .module('app.users', [])
    .config(config)
    .component(EclipseUsersGrid.selector, EclipseUsersGrid)
    .component(UsersSettings_.selector, UsersSettings_)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.users', {
        url: '/settings/users',
        views: {
            'content@app': {
                template: '<users-settings></users-settings>'
            }
        }
    });

    msNavigationServiceProvider.saveItem('settings.users', {
        title: 'Users',
        state: 'app.users',
        weight: 9,
    });
}
