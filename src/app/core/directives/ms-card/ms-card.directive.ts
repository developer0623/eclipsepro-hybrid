import angular from 'angular';

export default angular
    .module('app.core.directives.mscard', [])
    .directive('msCard', [msCardDirective])
    .name;

/** @ngInject */
function msCardDirective()
{
    return {
        restrict: 'E',
        scope   : {
            templatePath: '=template',
            card        : '=ngModel'
        },
        template: '<div class="ms-card-content-wrapper" ng-include="templatePath" onload="cardTemplateLoaded()"></div>',
        compile : function (tElement)
        {
            // Add class
            tElement.addClass('ms-card');

            return function postLink(scope, iElement)
            {
                // Methods
                scope.cardTemplateLoaded = cardTemplateLoaded;

                //////////

                /**
                 * Emit cardTemplateLoaded event
                 */
                function cardTemplateLoaded()
                {
                    scope.$emit('msCard::cardTemplateLoaded', iElement);
                }
            };
        }
    };
}