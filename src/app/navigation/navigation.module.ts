import { module } from 'angular';
import { NavigationController } from './navigation.controller';

export default module('app.navigation', [])
    .controller('NavigationController', NavigationController)
    .config(config)
    .name;

/** @ngInject */
function config() {

}