import angular from 'angular';
import ScheduleTimeline from './schedule-timeline.component';
import { DowntimePopupController } from './downtime-popup.controller';
import { helpScreensDialogController } from './helpScreensPopup.controller';

export default angular
  .module('app.schedule.timeline', [])
  .controller('DowntimePopupController', DowntimePopupController)
  .controller('helpScreensDialogController', helpScreensDialogController)
  .component(ScheduleTimeline.selector, ScheduleTimeline)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.schedule_timeline', {
    url: '/schedule/timeline',
    title: '',
    views: {
      'content@app': {
        template: '<schedule-timeline></schedule-timeline>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('schedule.timeline', {
    title: 'timeline',
    state: 'app.schedule_timeline',
    weight: 2,
    // claims: 'pro.machine.schedule.timeline',
  });
}
