
(function () {
    'use strict';

    angular
        .module('eclipsePro')
        .controller('RegisterModalController', RegisterModalController);

    function RegisterModalController($scope, $document, $mdDialog) {
        $scope.user = { email: '', username: '', password: '', passwordConfirm: '' };

        $scope.register = () => {
            $scope.errors = [];
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.gotoLogin = function () {
            $mdDialog.hide({ isLogin: true });
        }
    }
})();
