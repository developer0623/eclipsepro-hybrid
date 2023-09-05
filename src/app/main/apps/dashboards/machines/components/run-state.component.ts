
const RunStateIndicator = {
  bindings: {
    state: '<',
    lastRunStateChange: '<',
    isOffline: '<',
    isSchedule: '<',
    isNoPower: '<'
  },
  // REFACTOR: replace `isSchedule` with configuration type inputs tag-label
  template: `<div class="tag machine-status-tag" layout="row" layout-align="start center" ng-if="!$ctrl.isSchedule">
        <md-icon ng-if="$ctrl.isNoPower" md-font-icon="mdi-power-socket" class="mdi" style="padding-right:40px">
            <md-tooltip md-direction="top">Machine reported no power</md-tooltip>
        </md-icon>
      <!-- Run state time placeholder -->
        <md-icon ng-if="$ctrl.isOffline" md-font-icon="mdi-close-network" class="mdi" style="padding-right:40px">
            <md-tooltip md-direction="top">Machine is offline</md-tooltip>
        </md-icon> <!--todo:review space-->
        <div class="h4 run-state-time text-nowrap"><duration-display date="$ctrl.lastRunStateChange" /></div>
        <i class="mdi" ng-class="{ 'mdi-play': $ctrl.state==='R', 'mdi-close-circle-outline': $ctrl.state==='O', 'mdi-stop': $ctrl.state==='H' }"></i>
    </div>
    <div class="tag machine-status-tag schedule-run-state" layout="row" layout-align="start center" ng-if="$ctrl.isSchedule">
      <!-- Run state time placeholder -->
        <i class="mdi" ng-class="{ 'mdi-play': $ctrl.state=='R', 'mdi-close-circle-outline': $ctrl.state==='O', 'mdi-stop': $ctrl.state==='H' }"></i>
        <md-icon ng-if="$ctrl.isOffline" md-font-icon="mdi-close-network" class="mdi" style="padding-right:40px">
            <md-tooltip md-direction="top">Machine is offline</md-tooltip>
        </md-icon> <!--todo:review space-->
        <div class="run-state-time tag-label text-nowrap"><span class="for-text">for&nbsp;</span><duration-display date="$ctrl.lastRunStateChange" /></div>
    </div>`,
  controller: ['$element', function ($element) {
    let self = this;
    $element.addClass('run-state-indicator');
  }],
  controllerAs: '$ctrl'
}

export default RunStateIndicator;
