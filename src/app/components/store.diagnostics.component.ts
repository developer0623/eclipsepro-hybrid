import * as angular from "angular";
import { ClientDataStore } from '../core/services/clientData.store';
import { PerformanceData } from "../core/services/store/diagnostic/selectors";

const StoreStatisticsComp = {
      bindings: {},
      template: `
               <div layout="row">
                  <table border=1>
                        <tr>
                           <th colspan=5>Count of data actions against store</th>
                        </tr>
                        <tr>
                           <th>collection</th>
                           <th>put</th>
                           <th>del</th>
                           <th>initialize</th>
                           <th>chop</th>
                        </tr>
                        <tr ng-repeat="(collection, metrics) in $ctrl.performanceData.DebugCollectionMetrics">
                           <td>{{collection}}</td>
                           <td>{{metrics.put}}</td>
                           <td>{{metrics.del}}</td>
                           <td>{{metrics.initialize}}</td>
                           <td>{{metrics.chop}}</td>
                        </tr>
                  </table>
                  <div>&nbsp;</div>
                  <table border=1>
                        <tr>
                           <th colspan=5>Count of all actions by type</th>
                        </tr>
                        <tr>
                           <th>Action type</th>
                           <th>#</th>
                        </tr>
                        <tr ng-repeat="(action, count) in $ctrl.performanceData.DebugActionMetrics">
                           <td>{{action}}</td>
                           <td>{{count}}</td>
                        </tr>
                  </table>
                  <div>&nbsp;</div>
                  <table border=1>
                        <tr>
                           <th>Subscription count by collection</th>
                           <th>#</th>
                        </tr>
                        <tr ng-repeat="sub in $ctrl.performanceData.DebugSubscriptionMetrics">
                           <td>{{sub.collection}}</td>
                           <td>{{sub.count}}</td>
                        </tr>
                  </table>
               </div>`,
      controller: ['$scope', 'clientDataStore', function($scope, clientDataStore: ClientDataStore) {
         let self = this;

         const perfData_ = clientDataStore.Selector(PerformanceData)
            .do(performanceData => {
               self.performanceData = performanceData;
            })
            .subscribe();

         $scope.$on('$destroy', () => perfData_.dispose());
   }]
}

export default StoreStatisticsComp;
