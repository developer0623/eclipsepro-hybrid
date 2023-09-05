import angular from 'angular';
import UserSettings_ from './user.component';
import UserProfile from './user-profile.component';

export default angular
    .module('app.user', [])
    .component(UserProfile.selector, UserProfile)
    .component(UserSettings_.selector, UserSettings_)
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state("app.user", {
        url: "/settings/user/:userName",
        title: '',
        views: {
            "content@app": {
                template: '<user-settings></user-settings>'
            },
        },
    });
}
