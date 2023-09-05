// AmsMdTabScroll.$inject = ['$parse']
export function AmsMdTabScroll ($parse) {
  return {
    restrict: 'A',
    compile: function ($element, attr) {
      let fn = $parse(attr.amsMdTabScroll, null, true);
      return function ngEventHandler (scope, element) {
        element.on('wheel', function (event) {
          scope.$apply(function () { fn(scope, { $event: event }); });
        });
      };
    }
  };
}
