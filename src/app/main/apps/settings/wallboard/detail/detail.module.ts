import angular from 'angular';
import MainTemp from '../../../../../core/layouts/content-only.html';
import Temp from './detail.html';
import { WallboardDetailController } from './detail.controller';

export default angular
    .module('app.wallboard.detail', [])
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['$stateProvider']
function config($stateProvider)
{
    $stateProvider.state('app.andon_wallboard', {
        url    : '/wallboard/andon:andonId/machine:machineNumber',
        views  : {
            'main@'                                 : {
                template: MainTemp
            },
            'content@app.andon_wallboard': {
                template: Temp,
                controller : WallboardDetailController,
                controllerAs: 'vm'
            }
        }
    });
}
