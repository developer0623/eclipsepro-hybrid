export const featureFlagDirective: any = (featureFlagService, $interpolate) => {
   return {
      transclude: 'element',
      priority: 599,
      terminal: true,
      restrict: 'A',
      $$tlb: true,
      compile: function featureFlagCompile(tElement, tAttrs) {
         let hasHideAttribute = 'featureFlagHide' in tAttrs;

         tElement[0].textContent = ' featureFlag: ' + tAttrs.featureFlag + ' is ' + (hasHideAttribute ? 'on' : 'off') + ' ';

         return function featureFlagPostLink($scope, element, attrs, ctrl, $transclude) {
            let featureEl, childScope;
            $scope.$watch(function featureFlagWatcher() {
               let featureFlag = $interpolate(attrs.featureFlag)($scope);
               return featureFlagService.featureDisabled(featureFlag);
            }, function featureFlagChanged(isDisabled) {
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