import angular from 'angular';
const BulletChart_ = {
  selector: 'bulletChart',
  bindings: {
    current: '<',
    okLower: '<',
    okUpper: '<',
    target: '<',
    minValue: '<',
    maxValue: '<',
    lowerBetter: '<',
    display: '<',
    type: '<'
  },
  // Load the template
  template: `<nvd3 options="$ctrl.options" data="$ctrl.options.data" config="$ctrl.options.config" api="$ctrl.api"></nvd3>`,
  controller: ['$scope', 'unitsService', function ($scope, unitsService) {
    let self = this;

    function calculateBulletVM() {
      let data = {};
      let outType = unitsService.getUserUnits(self.type);
      let current = unitsService.convertUnits(self.current, self.type, 1, outType);
      let okLower = unitsService.convertUnits(self.okLower, self.type, 1, outType);
      let okUpper = unitsService.convertUnits(self.okUpper, self.type, 1, outType);
      let maxValue = unitsService.convertUnits(self.maxValue, self.type, 1, outType);
      let minValue = unitsService.convertUnits(self.minValue, self.type, 1, outType);
      let target = unitsService.convertUnits(self.target, self.type, 1, outType);

      let ranges = [okLower, okUpper, Math.max(maxValue, current)];
      let measures = [Math.max(current, 0)];
      let markers = [target];
      data = {
        'ranges': ranges,
        'measures': measures,
        'markers': markers,
        'rangeLabels': self.lowerBetter ?
          [
            'Good: ' + minValue + ' - ',
            'Ok: ' + okLower + ' - ',
            'Poor: ' + okUpper + ' - '
          ] :
          [
            'Poor: ' + minValue + ' - ',
            'Ok: ' + okLower + ' - ',
            'Good: ' + okUpper + ' - '
          ],
        'markerLabels': ['Target: '],
        'measureLabels': ['Current: ']
      };
      return data;
    }

    self.options = {
      chart: {
        type: 'bulletChart',
        transitionDuration: 0,
        height: self.display === 'wallboard' ? 40 : 25,
        width: null,
        margin: {
          top: 4,
          right: 4,
          bottom: 4,
          left: 4
        },
        callback: function (chart) {
          if (self.display === 'wallboard') {
            chart.container.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            chart.container.setAttribute('viewBox', '0 0 250 40');
          }
        }
      },
      config: {
        deepWatchData: true
      },
      data: calculateBulletVM()
    };

    self.metricContainers = function () {
      let metricContainer = document.getElementsByClassName('large-panel-metric');
      return {
        'h': (angular.element(metricContainer) as any).height(),
        'w': (angular.element(metricContainer) as any).width()
      };
    };

    $scope.$watch(self.metricContainers, function () {
      //self.api.refresh();
    }, true);

    $scope.$watch('current', function (d) {
      self.options.data = calculateBulletVM();
      //self.api.update();
    }, true);
  }],
  controllerAs: '$ctrl'
}

export default BulletChart_;
