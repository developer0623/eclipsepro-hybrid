import angular from 'angular';

export default angular
    .module('app.core.directives.splashscreen', [])
    .directive('msSplashScreen', msSplashScreenDirective)
    .name;

msSplashScreenDirective.$inject = ['$animate']
function msSplashScreenDirective($animate) {
    return {
        restrict: 'E',
        link    : function (scope, iElement)
        {
            let splashScreenRemoveEvent = scope.$on('msSplashScreen::remove', function ()
            {
                $animate.leave(iElement).then(function ()
                {
                    // De-register scope event
                    splashScreenRemoveEvent();

                    // Null-ify everything else
                    scope = iElement = null;
                });
            });
        }
    };
}
