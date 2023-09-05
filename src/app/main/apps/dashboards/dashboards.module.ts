import angular from 'angular';
import machinesModule from './machines/machines.module';

// TODO: Needs to come after app.core, but before app.dashboards...
// import './../../../core/directives/ms-navigation/ms-navigation.directive';

export default angular
    .module('app.dashboards', [
        machinesModule
    ])
    .config(config)
    .name;

    config.$inject = ['msNavigationServiceProvider']
function config(
    msNavigationServiceProvider
) {

    // Navigation
    msNavigationServiceProvider.saveItem('dashboards', {
        title: 'dashboards',
        icon: 'mdi-microsoft',//tile-four',
        weight: 1
    });

}
