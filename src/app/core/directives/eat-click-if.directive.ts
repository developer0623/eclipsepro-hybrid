export function eatClickIf ($parse, $rootScope) {
   return {
      // this ensure eatClickIf be compiled before ngClick
      priority: 100,
      restrict: 'A',
      compile: function($element, attr) {
      let fn = $parse(attr.eatClickIf);
      return {
         pre: function link(scope, element) {
            let eventName = 'click';
            element.on(eventName, function(event) {
            let callback = function() {
               if (fn(scope, {$event: event})) {
                  // prevents ng-click to be executed
                  event.stopImmediatePropagation();
                  // prevents href
                  event.preventDefault();
                  return false;
               }
            };
            if ($rootScope.$$phase) {
               scope.$evalAsync(callback);
            } else {
               scope.$apply(callback);
            }
            });
         },
         post: function() {}
      }
      }
   }
}