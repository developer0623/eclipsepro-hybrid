focusMe.$inject = ['$timeout']
export function focusMe ($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function (scope, element) {
      scope.$watch('trigger', function (value) {
        if (value === true) {
          //console.log('trigger',value);
          //$timeout(function() {
          element[0].focus();
          scope.trigger = false;
          //});
        }
      });
    },
  };
}
