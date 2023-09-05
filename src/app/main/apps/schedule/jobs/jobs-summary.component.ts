import { JobSetSummary } from '../../../../core/services/store/scheduler/selectors';
const JobsSummary = {
  bindings: {
    header: '<',
    jobSetSummary: '<',

    showHold: '<',
    showUnhold: '<',
    showUnschedule: '<',
    showSend: '<',
    showSchedule: '<',
    showDeselect: '<',

    clickHold: '&',
    clickUnhold: '&',
    clickUnschedule: '&',
    clickSend: '&',
    clickSchedule: '&',
    clickDeselect: '&',
  },
  template: `
  <div class="jobSetSummary" layout="column">
    <div class="top" layout="row" flex="none">
      <div flex layout-align="start start" class="md-subhead" translate>{{$ctrl.header}}</div>
      <md-menu flex="none">                                                           <!-- todo: move menu to top right -->
        <md-button class="md-icon-button more-btn" ng-click="$mdMenu.open($event)">
          <md-icon md-menu-origin md-font-icon="mdi-dots-vertical" class="mdi"></md-icon>
        </md-button>
        <md-menu-content width="4">
          <md-menu-item ng-if="$ctrl.showHold">
              <md-button ng-click="$ctrl.clickHold()" style="pointer-events: auto">
                                                                                      <!-- todo: figure out tooltips in menus -->
                <md-tooltip md-direction="left">Hold prevents a job from going to the machine.</md-tooltip>
                <md-icon md-font-icon="mdi-pause-circle" class="mdi"></md-icon>
                Hold
              </md-button>
          </md-menu-item>
          <md-menu-item ng-if="$ctrl.showUnhold">
            <md-button ng-click="$ctrl.clickUnhold()" style="pointer-events: auto">
              <md-tooltip md-direction="left">Hold prevents a job from going to the machine.</md-tooltip>
              <md-icon md-font-icon="mdi-pause-circle-outline" class="mdi"></md-icon>
              Remove hold
            </md-button>
          </md-menu-item>
          <md-menu-divider ng-if="$ctrl.showDivider"></md-menu-divider>
          <md-menu-item ng-if="$ctrl.showUnschedule">
            <md-button ng-click="$ctrl.clickUnschedule()" style="pointer-events: auto">
              <md-icon md-font-icon="mdi-calendar-remove" class="mdi"></md-icon>
              Unschedule
              <md-tooltip md-direction="left">Remove this job from the schedule</md-tooltip>
            </md-button>
          </md-menu-item>
          <md-menu-item ng-if="$ctrl.showSend">
            <md-button ng-click="$ctrl.clickSend()" style="pointer-events: auto">
              <md-icon md-font-icon="mdi-transfer" class="mdi"></md-icon>
              Send to machine
              <md-tooltip md-direction="left">Sends the job to the machine.</md-tooltip>
            </md-button>
          </md-menu-item>
          <md-menu-item ng-if="$ctrl.showSchedule">
            <md-button ng-click="$ctrl.clickSchedule()" style="pointer-events: auto">
              <md-tooltip md-direction="left">Add to the end of the schedule</md-tooltip>
              <md-icon md-font-icon="mdi-calendar-plus" class="mdi"></md-icon>
              Schedule
            </md-button>
          </md-menu-item>
          <md-menu-item ng-if="$ctrl.showDeselect">
            <md-button ng-click="$ctrl.clickDeselect()" style="pointer-events: auto">
              <md-tooltip md-direction="left">Add to the end of the schedule</md-tooltip>
              <md-icon md-font-icon="mdi-close" class="mdi"></md-icon>
              Uncheck All
            </md-button>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </div>
    <div layout="row" flex layout-align="space-between center">
      <div flex>
        {{$ctrl.jobSetSummary.count}} Jobs
      </div>
      <div flex style="text-align: right;">
        {{$ctrl.jobSetSummary.totalFt | unitsFormat: 'ft'}}
      </div>
    </div>
  </div>`,
  controller: class JobsSummaryComponentController {
    header: string;
    jobSetSummary: JobSetSummary;

    showHold: boolean;
    showUnhold: boolean;
    showUnschedule: boolean;
    showSend: boolean;
    showSchedule: boolean;
    showDeselect: boolean;

    showDivider: boolean;

    /** @ngInject */
    constructor() {}

    $onChanges() {
      this.showDivider =
        (this.showHold || this.showUnhold) &&
        (this.showUnschedule || this.showSend || this.showSchedule);
    }
  },
};

export default JobsSummary;
