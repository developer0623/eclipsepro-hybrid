runBlock.$inject = ['$rootScope', '$state', '$timeout'];

export function runBlock($rootScope, $state, $timeout) {
    // Activate loading indicator
    let stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function () {
        $rootScope.loadingProgress = true;
        $rootScope.hideSearch = false;
        $rootScope.$broadcast('hideSearch', $rootScope.hideSearch);
    });

    // De-activate loading indicator
    let stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
        $timeout(function () {
            $rootScope.loadingProgress = false;
        });
    });

    // Store state in the root scope for easy access
    $rootScope.$state = $state;

    // Cleanup
    $rootScope.$on('$destroy', function () {
        stateChangeStartEvent();
        stateChangeSuccessEvent();
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        event.preventDefault();

        // Redirect wallboard andon back to config if bad URL params
        if (toState.name === 'app.andon_wallboard' && error.status === 404) {
            $state.go('app.andon_config');
        }
    });

}
