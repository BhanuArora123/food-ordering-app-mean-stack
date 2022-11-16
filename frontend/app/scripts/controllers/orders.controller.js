

appModule
    .controller("ordersController", function ($scope, outletOrders, orderService) {
        // current order status
        $scope.currentOrderStatus = "All";

        $scope.orderStatuses = ["All", "Preparing", "Out For Delivery", "Closed"];

        $scope.actualOrderStatuses = ["Preparing", "Out For Delivery", "Closed"];

        $scope.getAllOutletOrders = outletOrders;

        $scope.currentScope = $scope;

        $scope.getHeight = function (viewPortScale) {
            return 600 * Math.ceil((outletOrders.length) / viewPortScale);
        }

        $scope.getOrders = function (status) {
            if (status === "All") {
                status = undefined;
            }
            orderService
                .getAllOrders(status)
                .then(function (data) {
                    $scope.getAllOutletOrders = data.orders;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }

        $scope.changeOrderStatus = function (status,orderId) {
            return orderService
            .changeStatus(status,orderId)
            .then(function (data) {
                return $scope.getOrders($scope.currentOrderStatus);
            })
            .catch(function (error) {
                console.log(error);
            })
        }
    })

appModule.controller("orderDetailsController", function ($scope,utility) {

    var selectedOrder = $scope.$parent.getAllOutletOrders[$scope.$parent.extraData.currentIndex];

    $scope.selectedOrder = selectedOrder;

    $scope.orderedFoodItems = utility.categorizeItems(selectedOrder.orderedItems);

    console.log($scope.orderedFoodItems);
    // display active category
    $scope.activeCategory = 0;
    $scope.activeSubcategory = 0;

    $scope.setActiveClass = function (index, type) {
        if (type === 'category') {
            $scope.activeCategory = index;
            $scope.activeSubcategory = 0;
        }
        else {
            $scope.activeSubcategory = index;
        }
    }

    $scope.getActiveClass = function (index, type) {
        if (type === 'category') {
            return ($scope.activeCategory === index) ? '' : 'opacity-medium';
        }
        else {
            return ($scope.activeSubcategory === index) ? '' : 'opacity-medium';
        }
    }
})