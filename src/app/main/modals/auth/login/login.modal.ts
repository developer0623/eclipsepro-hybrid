import * as angular from "angular";
import { ClientDataStore } from "./../../../../core/services/clientData.store";
import { SystemPreferences } from "./../../../../core/services/store/misc/selectors";


(function () {
    'use strict';

    angular
        .module('eclipsePro')
        .controller('LoginModalController', LoginModalController);

    function LoginModalController($scope, $mdDialog, clientDataStore: ClientDataStore) {
        $scope.user = { username: '', password: '' };

        $scope.setFocus = function (isUsername) {
            window.setTimeout(() => {
                let el;
                if (isUsername) {
                    el = angular.element(document.querySelector('#log_username'));
                } else {
                    el = angular.element(document.querySelector('#log_password'));
                }
                el.focus();
            }, 1000);
        }

        clientDataStore
            .Selector(SystemPreferences)
            .subscribe(pref => $scope.allowGuestUser = pref.allowGuestUser);

        $scope.rememberFlag = true;

        $scope.login = function () {
            $scope.errors = [];
            if ($scope.user.username) {
                $scope.errors = [];
            } else {
                $scope.errors = ['BadUsernameOrPassword'];
            }
        }

        $scope.loginAsGuest = function () {
            $scope.errors = [];
        };

        $scope.gotoRegister = function () {
            $mdDialog.hide({ isRegister: true });
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }
})();
