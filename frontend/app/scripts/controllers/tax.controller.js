
appModule.controller("taxController", function ($scope, taxService) {

    $scope.createTax = function (tax) {
        taxService
            .addTax(tax)
            .then(function () {
                $scope.$parent.taxModal.close();
            })
            .catch(function (error) {
                console.log(error);
            })
    }
})