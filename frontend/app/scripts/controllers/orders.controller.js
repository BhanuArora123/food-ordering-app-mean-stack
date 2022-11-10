

appModule
    .controller("ordersController",function ($scope,outletOrders) {

        $scope.getAllOutletOrders = outletOrders;

        $scope.currentScope = $scope;

        $scope.getHeight = function (viewPortScale) {
            return 600 * Math.ceil((outletOrders.length)/viewPortScale);
        }
    })

appModule.controller("orderDetailsController",function($scope){

    $scope.allOrders = $scope.$parent.getAllOutletOrders;

    console.log($scope.allOrders);
})