

appModule
    .controller("ordersController", function ($scope, outletOrders, orderService, utility) {
        // current order status
        $scope.currentOrderStatus = "All";

        $scope.orderStatuses = ["All", "Preparing", "Out For Delivery", "Closed"];

        $scope.actualOrderStatuses = ["Preparing", "Out For Delivery", "Closed"];

        $scope.getAllOutletOrders = outletOrders;

        $scope.currentScope = $scope;

        // get role 
        $scope.getRole = function () {
            return utility.getRole();
        }

        $scope.getHeight = function (viewPortScale) {
            return 600 * Math.ceil((outletOrders.length) / viewPortScale);
        }

        $scope.getOrders = function (status, type) {
            if (status === "All") {
                status = undefined;
            }
            orderService
                .getAllOrders(status, type)
                .then(function (data) {
                    $scope.getAllOutletOrders = data.orders;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }

        $scope.changeOrderStatus = function (status, orderId) {
            return orderService
                .changeStatus(status, orderId)
                .then(function (data) {
                    return $scope.getOrders($scope.currentOrderStatus);
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    })

appModule.controller("orderDetailsController", function ($scope, utility, orderService) {

    var selectedOrder = $scope.$parent.getAllOutletOrders[$scope.$parent.extraData.currentIndex];

    $scope.selectedOrder = selectedOrder;

    $scope.orderedFoodItems = utility.categorizeItems(selectedOrder.orderedItems);

    console.log($scope.orderedFoodItems);

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
            return ($scope.activeCategory === index) ? 'bg-primary text-white border-0' : 'text-dark border-1 border-secondary';
        }
        else {
            return ($scope.activeSubcategory === index) ? 'bg-primary text-white border-0' : 'text-dark border-1 border-secondary';
        }
    }

    // get Role
    $scope.getRole = $scope.$parent.getRole;

    // edit dine order details 

    $scope.makeOrderEditable = function () {
        $scope.isEditClicked = true;
    }
    $scope.cancelEdit = function () {
        $scope.isEditClicked = false;
    }
    $scope.updateOrder = function (orderId,categorizedOrderedItems) {
        var orderedItems = utility.decategorizeItems(categorizedOrderedItems);
        $scope.isEditClicked = false;
        console.log(orderedItems);
        orderService
        .editOrder(orderId,orderedItems)
        .then(function (data) {
            alert(data.message);
            return data.orderData;
        })
        .catch(function (error) {
            console.log(error);
        })
    }
})