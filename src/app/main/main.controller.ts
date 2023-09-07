import rg4js from 'raygun4js';
import { Transition } from '@uirouter/angularjs';

declare let gtag;

MainController.$inject = ['$scope', '$rootScope', '$transitions', 'userClaimsService', 'msNavigationService']
export function MainController(
   $scope: angular.IScope,
   $rootScope: angular.IRootScopeService,
   $transitions: Transition,
   userClaimsService,
   msNavigationService
) {
   // Data
   let vm = this;

   // Remove the splash screen
   $scope.$on("$viewContentAnimationEnded", function (event) {
      if (event.targetScope.$id === $scope.$id) {
         $rootScope.$broadcast("msSplashScreen::remove");
      }
   });

   // https://ui-router.github.io/guide/transitions

   $transitions.onStart({}, (trans) => {
      let claims = msNavigationService.getClaimsForName(trans.to().name);

      if (claims) {
         if (userClaimsService.hasClaim(claims) === false) {
            // If you see this in the console, it means we still had a navigable route. (Iow, somebody was able
            // to click on something and get here. The nav should have not been present.)
            console.log("Preventing transition due to lack of claims: " + claims);
            return false;
         }
      }
   });

   $transitions.onSuccess({}, (trans) => {
      rg4js("trackEvent", {
         type: "pageView",
         path: trans.to().url,
      });
      gtag("event", "page_view", {
         page_title: trans.to().name,
         page_path: trans.to().url,
      });
   });
}
