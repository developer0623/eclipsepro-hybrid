import angular from 'angular';

export default angular
    .module('app.core.directives.msTooltip', [])
    .controller('MsTooltipController', MsTooltipController)
    .directive('msTooltip', msTooltipDirective as any)
    .name;

/** @ngInject */
function MsTooltipController() { }
/** @ngInject */
function msTooltipDirective() {
    return {
        restrict: 'E',
        controller: 'MsTooltipController',
        transclude: true,
        replace: true,
        template: `<md-tooltip class="multi-line">
                    <div class="tooltip-container">
                        <ng-transclude></ng-transclude>
                    </div>
                    </md-tooltip>`,
        scope: false,
    };
}
