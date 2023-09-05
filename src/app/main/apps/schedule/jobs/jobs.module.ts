import angular from 'angular';
import Temp from './jobs.html';
import { JobsController } from './jobs.controller';
import Jobs_ from './jobs_component/jobs.component';
import AssignedJob from './assigned-job.component';
import AssignedJobsWide from './assigned-jobs-wide.component';
import AssignedJobs from './assigned-jobs.component';
import AvailableJobs from './available-jobs.component';
import JobsSummary from './jobs-summary.component';
import AppJobs_ from './jobs-list.component';

export default angular
  .module('app.schedule.jobs', [])
  .component(AppJobs_.selector, AppJobs_)
  .component('jobs', Jobs_)
  .component('assignedJob', AssignedJob)
  .component(AssignedJobsWide.selector, AssignedJobsWide)
  .component(AssignedJobs.selector, AssignedJobs)
  .component('availableJobs', AvailableJobs)
  .component('jobsSummary', JobsSummary)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.schedule_jobs', {
    //url: '/schedule/jobs/:machineId', //this is preferred but
    // angluarJs doesn't have a good way to update the url without re-rendering
    // so, going with query string for now
    url: '/schedule/jobs?machine',
    // claims: 'pro.machine.schedule.scheduler',
    title: 'scheduler',
    reloadOnSearch: false,
    views: {
      'content@app': {
        template: '<app-jobs></app-jobs>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('schedule.jobs', {
    title: 'scheduler',
    state: 'app.schedule_jobs',
    weight: 1,
    // claims: 'pro.machine.schedule.scheduler',
  });
}
