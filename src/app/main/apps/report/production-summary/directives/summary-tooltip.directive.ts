import angular from 'angular';
headerTooltip.$inject = ['$compile', '$sce']
export function headerTooltip($compile, $sce) {
  return {
    restrict: 'A',
    scope: {
      content: '=tooltipContent',
      dblClickCallback: '&',
      isTimebar: '='
    },
    link: function (scope, element, attrs) {

      const left = element[0].clientWidth / 2 + 10;
      const side = scope.isTimebar ? "right" : "left";
      let tooltip = angular.element(
        `<div class="summary-title-expalin" style="${side}: ${left}px;">
            <div class="title">${scope.content.title}</div>
            <div class="description">${scope.content.description}</div>
          </div>`
      );
      let removeFunc = function () {
        if (scope.displayTooltip) {
          if (element[0].children[0].className === 'summary-title-expalin ng-scope') {
            let myEl = angular.element(element[0].children[0]);
            myEl.remove();
          } else if (scope.isTimebar) {
            let myEl = angular.element(element[0].children[1]);
            myEl.remove();
          } else {
            let myEl = angular.element(element[0].children[2]);
            myEl.remove();
          }
        }
        scope.displayTooltip = false;


      }

      /* Bindings */

      element.on('mouseenter', function (event) {
        element.append(tooltip);
        scope.displayTooltip = true;
        scope.$digest();
        event.preventDefault();
      });
      element.on('click', function (event) {
        removeFunc();
        scope.$digest();
        event.preventDefault();
      });

      element.on('dblclick', function (event) {
        removeFunc();
        scope.dblClickCallback({ index: scope.content.index });
        scope.$digest();
        event.preventDefault();
      });

      element.on('mouseleave', function () {
        removeFunc();
        scope.$digest();
        event.preventDefault();
      });



      /* Compile */

      $compile(tooltip)(scope);
    }
  };

}
