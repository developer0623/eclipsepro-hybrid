import * as angular from "angular";
import { ClientDataStore } from "../services/clientData.store";
import { IAppState } from "../services/store";
import { UserHasClaim } from "../services/store/user/selectors";

export const ifNotClaimDirective: any = (clientDataStore: {getValue: () => any}, $interpolate) => {
   return {
      transclude: 'element',
      priority: 599,
      terminal: true,
      restrict: 'A',
      $$tlb: true,
      compile: function ifClaimCompile(tElement, tAttrs) {
         let hasHideAttribute = 'ifClaimHide' in tAttrs;

         tElement[0].textContent = ' ifClaim: ' + tAttrs.ifClaim + ' is ' + (hasHideAttribute ? 'on' : 'off') + ' ';

         return function ifClaimPostLink($scope, element, attrs, ctrl, $transclude) {
            let featureEl, childScope;
            $scope.$watch(function ifClaimWatcher() {
               let ifClaim = $interpolate(attrs.ifClaim)($scope);
               // The lack of ! is necessary due to the backwardsness of our original 
               // feature-flag implementation from which this is copied. That
               // was not one of my best ideas.
               return UserHasClaim(ifClaim)(clientDataStore.getValue());
            }, function ifClaimChanged(isDisabled) {
               let showElement = hasHideAttribute ? isDisabled : !isDisabled;

               if (showElement) {
                  childScope = $scope.$new();
                  $transclude(childScope, function(clone) {
                     featureEl = clone;
                     element.after(featureEl).remove();
                  });
               } else {
                  if (childScope) {
                     childScope.$destroy();
                     childScope = null;
                  }
                  if (featureEl) {
                     featureEl.after(element).remove();
                     featureEl = null;
                  }
               }
            });
         };
      }
   };
}