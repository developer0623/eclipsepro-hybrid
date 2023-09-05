ResetPasswordModalController.$inject = ['$scope', '$mdDialog', 'user', 'api']
export function ResetPasswordModalController($scope, $mdDialog, user, api) {
    $scope.user = { password:'', passwordConfirm: ''};


    $scope.reset = () => {
      $scope.errors = [];
      // TODO: Show the errors in the ui (they are internationalizable)
        api.users.setpassword({username: user.userName}, $scope.user, result => $mdDialog.hide({isSuccess:true}), error => $scope.errors = error.errors)
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
}
