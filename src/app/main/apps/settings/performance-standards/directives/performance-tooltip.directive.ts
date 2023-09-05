import angular from 'angular';

performanceTooltip.$inject = ['$compile', '$sce', '$timeout']
export function performanceTooltip($compile, $sce, $timeout) {
    return {
      restrict: 'A',
      scope: {
        content: '=tooltipContent',
        isshow: '=tooltipFocus',
        dblClickCallback: '&',
        clickCallback: '&'
      },
      link: function(scope, element, attrs) {

        const left = element[0].clientWidth/2 + 10;
        let tooltip = angular.element(
          `<div class="performance-tooltip" ng-if="displayTooltip && !isshow">
            <div class="title">Machine Planning Default</div>
            <performance-chart value="content" class="hover-performance"></performance-chart>
            <div class="tooltip-content">
              <div class="tooltip-content__header">
                <div class="header-item">
                  <div class="header-itemfont-bold">PART LENGTH</div>
                  <div class="header-item--normal">INCHES</div>
                </div>
                <div class="header-item">
                  <div class="header-itemfont-bold">SPEED</div>
                  <div class="header-item--normal">FEET PER MINUTE</div>
                </div>
              </div>
              <div class="tooltip-content__item" ng-repeat="item in content">
                <div>{{item.lengthIn}}</div>
                <div>{{item.fpm}}</div>

              </div>
            </div>
          </div>`
        );
        element.append(tooltip);


        /* Bindings */

        element.on('mouseenter', function(event) {
          scope.displayTooltip = true;

          scope.$digest();
          event.preventDefault();
        });
        element.on('click', function(event) {
          scope.clickCallback({event: event});
          scope.displayTooltip = false;
          scope.$digest();
          event.preventDefault();
        });

        element.on('dblclick', function(event) {
          scope.dblClickCallback({event: event});
          scope.displayTooltip = false;
          scope.$digest();
          event.preventDefault();
        });

        element.on('mouseleave', function() {
          scope.displayTooltip = false;
          scope.$digest();
          event.preventDefault();
        });



        /* Compile */

        $compile(tooltip)(scope);
      }
    };

}
