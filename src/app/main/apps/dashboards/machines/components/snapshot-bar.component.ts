
const SnapshotBar = {

  bindings: {
    running: '<',
    exempt: '<',
    changeover: '<',
    downtime: '<',
    breakdown: '<',
    offline: '<'
  },
  // Load the template<div class="snapshot-bar layout-row flex-100" flex="100" layout="row">
  template: `
  <div class="running" ng-if="$ctrl.running" ng-class="{'ph-8': $ctrl.$mdMedia('gt-sm')}" style="flex-basis: {{$ctrl.running*100/$ctrl.total()}}%; width: {{$ctrl.running*100/$ctrl.total()}}%;">
      <span ng-if="$ctrl.running*100/$ctrl.total() >= 4" class="snapshot-label" ng-class="{'text-right font-size-16': $ctrl.$mdMedia('gt-xs'), 'text-center font-size-14': $ctrl.$mdMedia('xs')}">{{$ctrl.running*100/$ctrl.total() | number:1}}%</span>
      <md-tooltip><span translate="running">Running</span>: {{$ctrl.running | number:1}} min | {{$ctrl.running*100/$ctrl.total() | number:1}}%</md-tooltip>
  </div>
  <div class="exempt" ng-if="$ctrl.exempt" ng-class="{'ph-8': $ctrl.$mdMedia('gt-sm')}" style="flex-basis: {{$ctrl.exempt*100/$ctrl.total()}}%; width: {{$ctrl.exempt*100/$ctrl.total()}}%;">
      <span ng-if="$ctrl.exempt*100/$ctrl.total() >= 4" class="snapshot-label" ng-class="{'text-right font-size-16': $ctrl.$mdMedia('gt-xs'), 'text-center font-size-14': $ctrl.$mdMedia('xs')}">{{$ctrl.exempt*100/$ctrl.total() | number:1}}%</span>
      <md-tooltip><span translate="unscheduled">Unscheduled</span>: {{$ctrl.exempt| number:1}} min | {{$ctrl.exempt*100/$ctrl.total() | number:1}}%</md-tooltip>
  </div>
  <div class="changeover" ng-if="$ctrl.changeover" ng-class="{'ph-8': $ctrl.$mdMedia('gt-sm')}" style="flex-basis: {{$ctrl.changeover*100/$ctrl.total()}}%; width: {{$ctrl.changeover*100/$ctrl.total()}}%;">
      <span ng-if="$ctrl.changeover*100/$ctrl.total() >= 4" class="snapshot-label" ng-class="{'text-right font-size-16': $ctrl.$mdMedia('gt-xs'), 'text-center font-size-14': $ctrl.$mdMedia('xs')}">{{$ctrl.changeover*100/$ctrl.total() | number:1}}%</span>
      <md-tooltip><span translate="changeover">Changeover</span>: {{$ctrl.changeover| number:1}} in. | {{$ctrl.changeover*100/$ctrl.total() | number:1}}%</md-tooltip>
  </div>
  <div class="downtime" ng-if="$ctrl.downtime" ng-class="{'ph-8': $ctrl.$mdMedia('gt-sm')}" style="flex-basis: {{$ctrl.downtime*100/$ctrl.total()}}%; width: {{$ctrl.downtime*100/$ctrl.total()}}%;">
      <span ng-if="$ctrl.downtime*100/$ctrl.total() >= 4" class="snapshot-label" ng-class="{'text-right font-size-16': $ctrl.$mdMedia('gt-xs'), 'text-center font-size-14': $ctrl.$mdMedia('xs')}">{{$ctrl.downtime*100/$ctrl.total() | number:1}}%</span>
      <md-tooltip><span translate="downtime">Downtime</span>: {{$ctrl.downtime| number:1}} min | {{$ctrl.downtime*100/$ctrl.total() | number:1}}%</md-tooltip>
  </div>
  <div class="breakdown" ng-if="breakdown" ng-class="{'ph-8': $ctrl.$mdMedia('gt-sm')}" style="flex-basis: {{$ctrl.breakdown*100/$ctrl.total()}}%; width: {{$ctrl.breakdown*100/$ctrl.total()}}%;">
      <span ng-if="$ctrl.breakdown*100/$ctrl.total() >= 4" class="snapshot-label" ng-class="{'text-right font-size-16': $ctrl.$mdMedia('gt-xs'), 'text-center font-size-14': $ctrl.$mdMedia('xs')}">{{$ctrl.breakdown*100/$ctrl.total() | number:1}}%</span>
      <md-tooltip><span translate="breakdown">Breakdown</span>: {{$ctrl.breakdown| number:1}} min | {{$ctrl.breakdown*100/$ctrl.total() | number:1}}%</md-tooltip>
  </div>
  <div class="offline" ng-if="offline" ng-class="{'ph-8': $ctrl.$mdMedia('gt-sm')}" style="flex-basis: {{$ctrl.offline*100/$ctrl.total()}}%; width: {{$ctrl.offline*100/$ctrl.total()}}%;">
      <span ng-if="$ctrl.offline*100/$ctrl.total() >= 4" class="snapshot-label" ng-class="{'text-right font-size-16': $ctrl.$mdMedia('gt-xs'), 'text-center font-size-14': $ctrl.$mdMedia('xs')}">{{$ctrl.offline*100/$ctrl.total() | number:1}}%</span>
      <md-tooltip><span translate="offline">Offline</span>: {{$ctrl.offline| number:1}} min | {{$ctrl.offline*100/$ctrl.total() | number:1}}%</md-tooltip>
  </div>`,
  //</div>`,
  controller: ['$mdMedia', '$element', function ($mdMedia, $element) {
    let self = this;

    $element.addClass('snapshot-bar layout-row flex-100');

    self.$mdMedia = $mdMedia;
    self.total = function () {
      let result = (self.running || 0) + (self.exempt || 0) + (self.changeover || 0) + (self.downtime || 0) + (self.breakdown || 0) + (self.offline || 0);
      return result;
    };
  }],
  controllerAs: '$ctrl'
};

export default SnapshotBar;
