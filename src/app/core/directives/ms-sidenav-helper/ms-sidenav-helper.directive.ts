import angular from 'angular';

export default angular
    .module('app.core.directives.mssidenavhelper', [])
    .directive('msSidenavHelper', msSidenavHelperDirective)
    .name;

function msSidenavHelperDirective() {
    return {
        restrict: 'A',
        require : '^mdSidenav',
        link    : function (scope, iElement, iAttrs, MdSidenavCtrl)
        {
            // Watch md-sidenav open & locked open statuses
            // and add class to the ".page-layout" if only
            // the sidenav open and NOT locked open
            scope.$watch(function ()
            {
                return MdSidenavCtrl.isOpen() && !MdSidenavCtrl.isLockedOpen();
            }, function (current, old)
            {
                if ( angular.isUndefined(current) )
                {
                    return;
                }

                iElement.parents('.page-layout').toggleClass('sidenav-open', current);
            });
        }
    };
}