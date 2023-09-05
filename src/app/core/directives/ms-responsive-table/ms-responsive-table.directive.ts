import angular from 'angular';

export default angular
    .module('app.core.directives.msresponsivetable', [])
    .directive('msResponsiveTable', msResponsiveTableDirective)
    .name;

function msResponsiveTableDirective()
{
    return {
        restrict: 'A',
        link    : function (scope, iElement)
        {
            // Wrap the table
            let wrapper = angular.element('<div class="ms-responsive-table-wrapper"></div>');
            iElement.after(wrapper);
            wrapper.append(iElement);

            //////////
        }
    };
}
