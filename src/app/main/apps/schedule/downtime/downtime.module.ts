import angular from 'angular';
import { DowntimePopupController } from './downtime-popup.controller';
import { ScheduleDowntimeController } from './downtime.controller';
import { RepeatDialogController } from './downtimeRepeatPopup.controller';
import Temp from './downtime.template.html';

export default angular
  .module('app.schedule.downtime', [])
  .controller('DowntimePopupController', DowntimePopupController)
  .controller('ScheduleDowntimeController', ScheduleDowntimeController)
  .controller('RepeatDialogController', RepeatDialogController)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.schedule_downtime', {
    url: '/schedule/downtime',
    title: '',
    views: {
      'content@app': {
        template: Temp,
        controller: ['$scope', 'machineData', 'downtimeData',  '$mdDialog', '$mdMedia', ScheduleDowntimeController],
        controllerAs: 'vm'
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('schedule.downtime', {
    title: 'plannedDowntime',
    state: 'app.schedule_downtime',
    // claims: 'pro.machine.schedule.scheduler pro.machine.schedule.timeline',
    weight: 3,
  });
}
