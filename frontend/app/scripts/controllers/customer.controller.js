

appModule.controller("customerController",function ($scope,$rootScope,$timeout,customerData,orderService,socketService,utility) {
    $scope.customerData = customerData;

    socketService.recieveEvent("orderStatusChanged",function (data) {
        console.log(data);
        $scope.highlightOrderId = data.orderData._id;
        $scope.customerOrders = $scope.customerOrders.map(function (order) {
            if(order._id === data.orderData._id){
                console.log("here...");
                return data.orderData;
            }
            return order;
        })
        $rootScope.success = data.message;
        $scope.$apply();
    })

    $scope.getCustomerOrders = function (page,limit) {
        console.log($scope.customerOrders?.currentPage);
        orderService
        .getAllOrders(undefined,undefined,customerData._id,page,limit)
        .then(function (data) {
            $scope.customerOrders = data.orders;
            $scope.totalOrders = data.totalOrders;
            // $scope.$apply();
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.viewDetails = function (index) {
        $scope.getAllOutletOrders = $scope.customerOrders;
        return utility.openModal(
            'views/orders/displayModal.html',
            'orderDetailsController',
            'orderDisplayModal',
            $scope,
            {
                currentIndex: index
            },
            $scope
        )
    }

    $scope.getHighlightClass = function (orderId) {
        // console.log(orderId,$scope.highlightOrderId);
        if($scope.highlightOrderId === orderId){
            $timeout(function () {
                $scope.highlightOrderId = undefined;
                $rootScope.success = undefined;
            },5000);
            return "bg-info";
        }
        return "";
    }
})