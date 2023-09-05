import * as angular from "angular";
import { ClientDataStore } from "../services/clientData.store";
import { IAppState } from "../services/store";
import { UserHasRole } from "../services/store/user/selectors";

export const ifRoleDirective: any = (clientDataStore: {getValue: () => any}, $interpolate) => {
   return {
      transclude: 'element',
      priority: 599,
      terminal: true,
      restrict: 'A',
      $$tlb: true,
      compile: function ifRoleCompile(tElement, tAttrs) {
         let hasHideAttribute = 'ifRoleHide' in tAttrs;

         tElement[0].textContent = ' ifRole: ' + tAttrs.ifRole + ' is ' + (hasHideAttribute ? 'on' : 'off') + ' ';

         return function ifRolePostLink($scope, element, attrs, ctrl, $transclude) {
            let featureEl, childScope;
            $scope.$watch(function ifRoleWatcher() {
               let ifRole = $interpolate(attrs.ifRole)($scope);
               // The ! is necessary due to the backwardsness of our original 
               // feature-flag implementation from which this is copied. That
               // was not one of my best ideas.
               return !UserHasRole(ifRole)(clientDataStore.getValue());
            }, function ifRoleChanged(isDisabled) {
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