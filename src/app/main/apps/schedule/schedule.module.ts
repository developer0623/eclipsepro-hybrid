import angular from 'angular';
import { onFinishRender } from './directives/onfinish-render';
import { timelineBlock } from './directives/timeline-block-directive';
import { timelineXAxis } from './directives/timeline-xaxis-directive';
import downTimeModule from './downtime/downtime.module';
import timelineModule from './timeline/timeline.module';
import jobsModule from './jobs/jobs.module';

export default angular
  .module('app.schedule', [
    timelineModule,
    jobsModule,
    downTimeModule,
  ])
  .directive('onFinishRender', onFinishRender)
  .directive('timelineBlock', timelineBlock)
  .directive('timelineXAxis', timelineXAxis)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  // Navigation
  msNavigationServiceProvider.saveItem('schedule', {
    title: 'schedule',
    icon: 'mdi-calendar',
    weight: 2,
  });
}
