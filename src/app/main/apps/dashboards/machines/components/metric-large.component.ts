const MetricLarge_ = {
   selector: 'metricLarge',
   bindings: {
      metric: '<',
      metricDefinition: '<',
      currentPrimary: '<',
      currentSecondary: '<',
      statsHistory: '<'
   },
   template: `
   <div layout="column" flex ng-class="$ctrl.metricClass">
      <div layout="row" layout-align="space-between" flex>
         <div class="h3 secondary-text text-upper pb-8  margin0" ng-class="{'pl-8': $mdMedia('xs')}" translate="{{$ctrl.metricDefinition.metricId}}">{{$ctrl.metricDefinition.metricId}}</div>
         <help-icon header="$ctrl.metricDefinition.metricId" help="$ctrl.metricDefinition.nameToolTip"></help-icon>
      </div>
      <div layout="row" layout-align="start">
         <div flex="40" ng-class="{'pb-8': $mdMedia('gt-xs'), 'font-size-24 pb-8 pl-8': $mdMedia('xs'), 'font-size-32': !$mdMedia('xs') || !$mdMedia('gt-lg'), 'font-size-36': $mdMedia('gt-lg')}" class="line-height-1 font-weight-500">
            {{$ctrl.currentPrimary | unitsFormat :$ctrl.metricDefinition.primaryUnits:3:true:true}}<sup ng-class="{'font-size-16': $mdMedia('gt-xs'), 'font-size-12': $mdMedia('xs')}">{{$ctrl.metricDefinition.primaryUnits | userDisplayUnits}}</sup>
            <div class="line-height-1 font-size-13 black-text text-nowrap" style="position: relative; top: 3px; left: 3px;">
                  {{$ctrl.currentSecondary | unitsFormat :$ctrl.metricDefinition.secondaryUnits:1}}
            </div>
         </div>
         <!--todo:unit display filter-->
         <div flex="60" ng-class="{'pr-8 pb-8': $mdMedia('gt-md')}" class="sparkline-container">
            <sparkline current="$ctrl.currentPrimary" type="$ctrl.metricDefinition.primaryUnits" stats="$ctrl.statsHistory"></sparkline>
         </div>
      </div>
      <div class="font-size-12 secondary-text pb-8 text-nowrap hide">{{$ctrl.currentSecondary | number: 0 }} {{$ctrl.metricDefinition.secondaryUnits}} &nbsp;</div>
      <div ng-class="{'pb-16': $mdMedia('gt-xs')}" class="bullet-container">
         <bullet-chart current="$ctrl.currentPrimary" type="$ctrl.metricDefinition.primaryUnits" min-value="$ctrl.metric.minValue" ok-lower="$ctrl.metric.okRangeStart" ok-upper="$ctrl.metric.okRangeEnd" target="$ctrl.metric.targetValue"
            max-value="$ctrl.metric.maxValue" lower-better="$ctrl.metricDefinition.lowerIsBetter"></bullet-chart>
      </div>
   </div>
   `,

   controller: function () {
      let self = this;
      this.$onInit = function () {
         self.metricClass = calcMetricClass();
      }


      function calcMetricClass() {
         let lowerBetter = self.metricDefinition.lowerIsBetter;

         // Trim K unit from metricValue and convert
         // if (metricValue.includes('K')) {
         //     metricValue = metricValue.slice(0, -1) * 1000;
         // }

         if (self.currentPrimary <= self.metric.okRangeStart) {
            return lowerBetter ? 'lower-better metric-good' : 'metric-bad';
         }
         else if (self.currentPrimary > self.metric.okRangeStart && self.currentPrimary < self.metric.okRangeEnd) {
            return (lowerBetter ? 'lower-better ' : '') + 'metric-ok';
         }
         return lowerBetter ? 'lower-better metric-bad' : 'metric-good';
      };
   }
}

export default MetricLarge_;
