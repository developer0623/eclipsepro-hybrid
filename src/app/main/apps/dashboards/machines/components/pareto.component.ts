import _ from 'lodash';

const Pareto = {
  bindings: {
    data: '<',        // Array of data objects to display
    name: '@',        // Data object property to use as the name
    value: '@',       // ' value
    occurances: '@',  // ' number of occurances
    topItems: '@',    // Top number of items to display.  Everything after this is lumped into 'other'
    barWidth: '@',
    barHeight: '@',
    update: '=',
    type: '@'
  },
  // Load the template<div class="snapshot-bar layout-row flex-100" flex="100" layout="row">
  template: `<table class="table-fixed table-pareto pareto">
          <tr ng-repeat="item in $ctrl.vm">
              <td ng-if="$ctrl.$mdMedia('gt-lg')" class="text-right" style="width: 45%;">
                  <div class="pareto-name text-truncate">{{item.name.toLowerCase()}}</div>
              </td>
              <td class="text-truncate pr-8">
                  <div class="pareto-rect" style="width: {{item.barPercent*100}}%;">
                      <div ng-if="!$ctrl.$mdMedia('gt-lg')" class="pareto-name">{{item.name.toLowerCase()}}</div>
                  </div>
                  <md-tooltip>{{item.name}}: {{item.toolTipText}}</md-tooltip>
              </td>
              <td ng-if="!$ctrl.$mdMedia('md')" class="pareto-value text-nowrap">
                {{item.value | number: 0}} {{$ctrl.units.toLowerCase()}}
              </td>
          </tr>
      </table>`,
  controller: ['$scope', '$mdMedia', 'unitsService', function ($scope, $mdMedia, unitsService) {
    let self = this;
    self.$mdMedia = $mdMedia;

    // set default values if not specified
    self.name = self.name || 'name';
    self.value = self.value || 'value';
    self.occurances = self.occurances || 'occurances';
    self.topItems = self.topItems || 0;
    self.barWidth = self.barWidth || 100;
    self.barHeight = self.barHeight || 20;
    self.data = self.data || [];
    self.units = self.type;// === 'scrap' ? 'ft' : 'min';

    // Generate the view model for the pareto chart
    function calculateParetoVm() {
      // Create a standardized data array using the provided accessor names
      let tempValues = self.data.map(function (o) { return { name: o[self.name], value: o[self.value], occurances: o[self.occurances] }; });
      //console.log(tempValues);
      // Sort the array by descending value
      /*global _ */
      _.sortBy(tempValues, function (o) { return -1 * o.value; });

      // Initialize the view model
      let vm = [];
      let other = { count: 0, total: 0, combinedNames: '' };
      self.units = unitsService.getUserUnits(self.type);

      for (let i = 0; i < tempValues.length; i++) {
        let newValue = tempValues[i];
        if (newValue.value < 0) {
          continue;
        }
        newValue.value = unitsService.convertUnits(newValue.value, self.type, 1, self.units);
        if (i < self.topItems) {
          //todo:format from service for ffi&fdi?
          newValue.toolTipText = newValue.value.toFixed(1) + ' ' + self.units;
          vm.push(newValue);
          //console.log(newValue);
        }
        else {
          other.total += newValue.value;
          other.count++;
          if (other.combinedNames !== '') {
            other.combinedNames += ', ';
          }
          other.combinedNames += newValue.name + ': ' + newValue.value.toFixed(1);
        }
      }
      if (other.count > 0) {
        vm.push({ name: 'Other (' + other.count + ')', value: other.total, toolTipText: other.combinedNames });
      }

      // Find the max and total value
      let maxValue = Math.max.apply(Math, tempValues.map(function (o) { return o.value; }));
      /*global _ */
      // lodash version required by angular-dc doesn't support _sum
      let sumValues = _.reduce(tempValues, function (sum, val) { return sum + val.value; });

      // Add percentages
      vm = vm.map(function (o) {
        o.valuePercent = o.value / sumValues;
        o.barPercent = o.value / maxValue;
        return o;
      });

      return vm;
    }

    // Calculated values
    // self.vm = calculateParetoVm();

    self.$onChanges = function (changes) {
      if (changes.data && changes.data.currentValue) {
        self.vm = calculateParetoVm();
      }
    }
  }],
  controllerAs: '$ctrl'
};
export default Pareto;
