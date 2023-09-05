import angular from 'angular';


export default angular
    .module('app.core.directives.mscard', [])
    .directive('msRandomClass', msRandomClassDirective)
    .name;

function msRandomClassDirective()
{
    return {
        restrict: 'A',
        scope   : {
            msRandomClass: '='
        },
        link    : function (scope, iElement)
        {
            let randomClass = scope.msRandomClass[Math.floor(Math.random() * (scope.msRandomClass.length))];
            iElement.addClass(randomClass);
        }
    };
}
