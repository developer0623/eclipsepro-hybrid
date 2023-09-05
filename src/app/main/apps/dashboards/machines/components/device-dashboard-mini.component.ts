
const DeviceDashboardMini = {
  selector: 'deviceDashboardMini',

  bindings: {
    device: '<',
    deviceState: '<',
    metrics: '<',
    shiftStats: '<'
  },
  template: `
    <div class="ms-widget">
      <div class="ms-widget-front white-bg" md-ink-ripple>
        <div class="p-16 h-55" layout="row" layout-align="space-between center">
            <div class="h4 text-truncate">
              {{$ctrl.device.name}}
              <md-tooltip>{{$ctrl.device.name}}</md-tooltip>
            </div>
            <run-state-indicator state="$ctrl.deviceState.runState" last-run-state-change="$ctrl.deviceState.lastRunStateChange" is-offline="$ctrl.deviceState.isOffline" is-no-power="$ctrl.deviceState.isNoPower"></run-state-indicator>
        </div>
        <div class="ph-16 pb-16" layout="row" flex layout-fill>
           <snapshot-bar height="10" width="100%"
              running="$ctrl.shiftStats.runMinutes"
              exempt="$ctrl.shiftStats.exemptMinutes"
              changeover="$ctrl.shiftStats.changeoverMinutes"
              downtime="$ctrl.shiftStats.nonExemptMinutes"
              breakdown="$ctrl.shiftStats.breakdownMinutes"
              >
           </snapshot-bar>
        </div>
        <div class="pb-8" layout="row" layout-align="start center" layout-wrap>
          <div layout="column" layout-align="center center" flex="33"
            ng-repeat="metric in $ctrl.metrics">
            <span class="font-size-20 font-weight-500">{{metric.value}}<sup class="font-size-12" ng-if="metric.units">{{metric.units}}</sup></span>
            <span class="h4 secondary-text">{{metric.name}}</span>
            <md-tooltip ng-if="metric.tooltip">{{metric.tooltip}}</md-tooltip>
          </div>
        </div>
      </div>
    </div>
    `,
  controller: ['$element', function ($element) {
    let self = this;

    $element.addClass('machine-panel-mini');
  }],
  controllerAs: '$ctrl'
}

export default DeviceDashboardMini;
