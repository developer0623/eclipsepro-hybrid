import MachineDashboardLargeTemplate from './machine-dashboard-large.component.html';
const MachineDashboardLarge = {

  bindings: {
    machine: '<',
    machineState: '<',
    shiftStats: '<',
    metricConfiguration: '<',
    metricDefinitions: '<',
    scheduleSummary: '<',
    statsHistory: '<',
    metricStatus: '<'
  },
  template: MachineDashboardLargeTemplate,
  controller: ['$element', '$mdMedia', function ($element, $mdMedia) {
      let self = this;
      self.$mdMedia = $mdMedia;

      $element.addClass('machine-panel-large');
  }],
  controllerAs: '$ctrl'
}

export default MachineDashboardLarge;
