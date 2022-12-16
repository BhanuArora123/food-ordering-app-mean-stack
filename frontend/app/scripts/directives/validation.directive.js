

appModule
  .directive('validFile', function () {
    return {
      require: 'ngModel',
      link: function ($scope, el, attrs, ngModel) {
        el.bind('change', function () {
          $scope.$apply(function () {
            console.log(el[0].files[0]);
            ngModel.$setViewValue(el[0].files[0]);
            ngModel.$render();
          });
        });
      }
    }
  })
  .directive("validPassword", function () {
    return {
      restrict: "EA",
      require: "ngModel",
      link: function (scope, element, attributes, control) {
        control.$validators.adult = function (modelValue, viewValue) {

          if (control.$isEmpty(modelValue)) {
            return false;
          }

          var passwordValidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[<>\:-\[\]\}\{!@#\$%\^&\*])(?=.{6,16})/;

          var isPasswordValid = passwordValidator.test(modelValue);

          console.log(isPasswordValid, modelValue);

          return (isPasswordValid && modelValue.length >= 6 && modelValue.length <= 16);
        }
      }
    }
  })