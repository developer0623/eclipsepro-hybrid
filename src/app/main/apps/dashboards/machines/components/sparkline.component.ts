import * as _ from 'lodash';

const Sparkline = {
  bindings: {
    stats: '<',
    current: '<',
    display: '<',
    type: '<'
  },
  // Load the template
  template: `<nvd3 options="$ctrl.options" data="$ctrl.data" config="$ctrl.config" api="$ctrl.api"></nvd3>`,
  controller: ['$scope', 'unitsService', function ($scope, unitsService) {
    let self = this;

    self.config = {
      deepWatchData: true
    };

    function calculateSparklineVm() {
      let data = [];
      let outType = unitsService.getUserUnits(self.type);
      _.sortBy(self.stats, ['shiftCode'])
        .map(function (item, index) {
          data.push({
            x: index,
            label: item.shiftCode,
            y: unitsService.convertUnits(item.value, self.type, 1, outType)
          });
        });

      data.push({ x: data.length, label: 'Current', y: unitsService.convertUnits(self.current, self.type, 1, outType) }); //todo: translate 'current'
      return data;
    }

    this.$onInit = function () {
      self.options = {
        chart: {
          type: 'sparklinePlus',
          height: self.display === 'wallboard' ? 150 : 50,
          width: null,
          showLastValue: false,
          noData: null,
          margin: {
            top: 20,
            bottom: 0,
            left: 20,
            right: 20
          },
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          xTickFormat: function (d) {
            return self.data[d].label; //this is not perfect but it is better than before and we now know how to control it.
          },
          callback: function (chart) {
            if (self.display === 'wallboard') {
              chart.container.setAttribute('preserveAspectRatio', 'xMinYMin meet');
              chart.container.setAttribute('viewBox', '0 0 200 150');
            }
          }
        }
      }

    }

    self.$onChanges = function (changes) {
      if (changes.stats && changes.stats.currentValue) {
        self.data = calculateSparklineVm();
      }
    }

  }],
  controllerAs: '$ctrl'
};

export default Sparkline;
