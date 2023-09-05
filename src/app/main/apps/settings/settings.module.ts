import angular from 'angular';
import bundlingModule from './bundling/bundling.module';
import downtimeModule from './downtime-settings/downtime-settings.module';
import experimentsModule from './experiments/experiments.module';
import integrationModule from './integration/integration.module';
import licensingModule from './licensing/licensing.module';
import metricConfigModule from './metric-config/metric-config.module';
import performanceModule from './performance-standards/performance-standards.module';
import printingModule from './printing/printing.module';
import statusModule from './status/status.module';
import systemModule from './system-preferences/system-preferences.module';
import updateModule from './update/update.module';
import usersModule from './users/users.module';
import userModule from './users/user.module';
import wallboardModule from './wallboard/wallboard.module';

export default angular
    .module('app.settings', [
        systemModule,
        metricConfigModule,
        performanceModule,
        printingModule,
        statusModule,
        bundlingModule,
        updateModule,
        integrationModule,
        licensingModule,
        experimentsModule,
        wallboardModule,
        usersModule,
        userModule,
        downtimeModule
    ])
    .config(config).name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    // Navigation
    msNavigationServiceProvider.saveItem('settings', {
        title: 'settings',
        icon: 'mdi-cog',
        weight: 9
    });
}
