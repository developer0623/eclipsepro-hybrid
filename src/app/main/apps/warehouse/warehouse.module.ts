import angular from 'angular';

import componetsModule from './tasks/components/taskItem';
import settingsModule from './app-settings/app-settings.module';
import tasksModule from './tasks/tasks.module';
import usersModule from './users/users.module';

export default angular
    .module('app.warehouse', [
        tasksModule,
        usersModule,
        settingsModule,
        componetsModule
    ])
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['msNavigationServiceProvider']
function config(msNavigationServiceProvider) {

    // Navigation
    msNavigationServiceProvider.saveItem('warehouse', {
        title: 'Warehouse',
        icon: 'mdi-forklift', //'icon-tile-four',
        weight: 6,
        claims: 'pro.machine.warehouse',
    });

    // Navigation
    msNavigationServiceProvider.saveItem('warehouse.launch', {
        title: 'Launch App',
        // state: '',
        icon: 'mdi-launch',
        href: '/app/warehouse/',
        target: '_blank',
        weight: 4,
        claims: 'pro.machine.warehouse',
    });

}
