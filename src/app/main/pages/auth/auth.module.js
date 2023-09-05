(function() {
    'use strict';

    angular
        .module('app.pages.auth', [
            'app.pages.auth.login',
            'app.pages.auth.register',
            'app.pages.auth.lock',
            'app.pages.auth.forgot-password'
        ]);

})();
