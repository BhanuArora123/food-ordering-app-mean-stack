

appModule
.directive("searchSelect",function (adminService) {
    return {
        restrict:"A",
        link:function (scope,ele,attrs) {
            
            var element = ele[0];
            element.onkeyup = function (event) {
                console.log(event.target.value);
                scope.$apply(function () {
                    adminService
                    .getBrands(1,9,event.target.value)
                    .then(function (data) {
                        scope.availableBrands = data.brands;
                        scope.$apply();
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                });
            }
        }
    }
})