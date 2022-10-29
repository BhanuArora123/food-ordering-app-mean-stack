

appModule.directive('validFile',function(){
    return {
      require:'ngModel',
      link:function($scope,el,attrs,ngModel){
        el.bind('change',function(){
          $scope.$apply(function(){
            console.log(el[0].files[0]);
            ngModel.$setViewValue(el[0].files[0]);
            ngModel.$render();
          });
        });
      }
    }
  });