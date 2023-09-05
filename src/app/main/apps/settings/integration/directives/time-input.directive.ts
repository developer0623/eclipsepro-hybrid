
export function timeInput () {
    return {
      require: '?ngModel',
      scope: {
        isHour: '@',
      },
      template:
        "<input class='time-input' ng-model='value' ng-change='onChange()'>",
      link: function (scope, element, attrs, ngModel) {
        if (!ngModel) return;

        const regEx =
          scope.isHour === 'true' ? /(2[0-3]|[01][0-9])/ : /[0-5][0-9]/;

        function onValid(val) {
          return regEx.test(val);
        }

        function onUpdate(val) {
          ngModel.$setViewValue(val);
          scope.value = val;
        }

        scope.onChange = function () {
          let convertedValue = '00';

          if (scope.value.length === 0) {
            onUpdate(convertedValue);
            return;
          }

          if (scope.value.length === 1) {
            convertedValue = `0${scope.value}`;
          } else if (scope.value.length === 3 && scope.value[0] === '0') {
            convertedValue = scope.value.substr(1);
          } else {
            onUpdate(ngModel.$modelValue);
            return;
          }

          const isValid = onValid(convertedValue);
          if (isValid) {
            onUpdate(convertedValue);
          } else {
            onUpdate(ngModel.$modelValue);
          }
        };

        ngModel.$render = function () {
          scope.value = ngModel.$modelValue;
        };
      },
    };
}
