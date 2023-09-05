// import * as d3 from 'd3';
declare let d3: any

const ShiftHistoryChart = {
   bindings: {
      shifts: '<',
      scale: '<'
   },
   template: `<span>Time: <a ng-click="$ctrl.toggleScale()" ng-style="$ctrl.scale === 'pct' && {'text-decoration': 'underline', 'cursor': 'pointer'}">Total</a> | <a ng-click="$ctrl.toggleScale()" ng-style="$ctrl.scale !== 'pct' && {'text-decoration': 'underline', 'cursor': 'pointer'}">Percent</a></span>
                  <nvd3 options="$ctrl.options" data="$ctrl.data"></nvd3>`,
   controller: function () {
      let self = this;
      self.toggleScale = function () {
         self.scale = self.scale === 'pct' ? 'min' : 'pct';
         self.calculateChartVM();
      }

      self.calculateChartVM = function () {
         let sortedShifts = self.shifts.filter(s => s.totalMinutes > 5)
            .sort((s1, s2) => {
               if (s1.startShiftCode > s2.startShiftCode) return 1;
               if (s1.startShiftCode < s2.startShiftCode) return -1;
               return 0;
            })
         let run = sortedShifts.map(shift => {
            return {
               x: shift.startShiftCode,
               y: self.scale === 'pct' ? shift.runPct * 100 : shift.runMinutes
            };
         });
         let exempt = sortedShifts.map(shift => {
            return {
               x: shift.startShiftCode,
               y: self.scale === 'pct' ? shift.exemptPct * 100 : shift.exemptMinutes
            };
         });
         let nonExempt = sortedShifts.map(shift => {
            return {
               x: shift.startShiftCode,
               y: self.scale === 'pct' ? shift.nonExemptPct * 100 : shift.nonExemptMinutes
            };
         });

         self.data = [
            { key: 'Run', values: run, color: '#4caf50' },
            { key: 'Exempt', values: exempt, color: '#ffb03b' },
            { key: 'Non-Exempt', values: nonExempt, color: '#f44336' },
         ];

         self.options.chart.yAxis.axisLabel = self.scale === 'pct' ? 'Percent' : 'Minutes';
      };

      self.options = {
         chart: {
            type: 'multiBarChart',
            transitionDuration: 0,
            height: 250,
            width: null,
            margin: {
               top: 20,
               right: 20,
               bottom: 45,
               left: 45
            },
            clipEdge: true,
            stacked: true,
            showControls: false,
            xAxis: {
               axisLabel: 'Shifts',
               showMaxMin: false
            },
            yAxis: {
               axisLabel: self.scale === 'pct' ? '' : 'Minutes',
               axisLabelDistance: -20,
               showMaxMin: false,
               tickFormat: function (d) {
                  return d3.format(',f')(d);
               }
            }
         },
         config: {
            deepWatchData: true
         },
      };

      self.$onChanges = function (changes) {
         self.calculateChartVM();
      };
   },
   controllerAs: '$ctrl'
};

export default ShiftHistoryChart;
