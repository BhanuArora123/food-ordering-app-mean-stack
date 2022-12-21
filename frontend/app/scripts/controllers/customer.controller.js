

appModule.controller("customerController",function ($scope,$rootScope,$timeout,customerData,orderService,socketService) {
    $scope.customerData = customerData;

    socketService.recieveEvent("orderStatusChanged",function (data) {
        console.log(data);
        $scope.highlightOrderId = data.orderData._id;
        $scope.customerOrders.map(function (order) {
            if(order._id === data.orderData._id){
                console.log("here...");
                return data.orderData;
            }
            return order;
        })
        $rootScope.success = data.message;
        $scope.$apply();
    })

    $scope.getCustomerOrders = function () {
        orderService
        .getAllOrders(undefined,undefined,customerData._id,1,9)
        .then(function (data) {
            $scope.customerOrders = data.orders;
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.getHighlightClass = function (orderId) {
        console.log(orderId,$scope.highlightOrderId);
        if($scope.highlightOrderId === orderId){
            $timeout(function () {
                $scope.highlightOrderId = undefined;
                $rootScope.success = undefined;
            },4000);
            return "bg-info";
        }
        return "";
    }
})