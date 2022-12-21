

appModule
    .controller("ordersController", function ($scope, $rootScope, outletOrders, orderService, outletService, utility,socketService,brandService, blockUI) {
        // current order status
        $scope.currentOrderStatus = "All";

        $scope.orderStatuses = ["All", "Preparing", "Out For Delivery", "Closed"];

        $scope.actualOrderStatuses = ["Preparing", "Out For Delivery", "Closed"];

        $scope.takeAway = {
            currentPage:1
        };

        $scope.dineIn = {
            currentPage:1
        };

        $scope.getAllOutletOrders = outletOrders.orders;
        $scope.totalOrders = outletOrders.totalOrders;
        
        console.log($scope.totalOrders);

        $scope.currentScope = $scope;

        $scope.currentOrderType = 'Dine In';

        // socket listeners 
        socketService.recieveEvent("orderCreation",function (data) {
            console.log(data,$scope.getAllOutletOrders);
            var orderData = data.orderData;
            if(orderData.orderType === $scope.currentOrderType){
                $scope.getAllOutletOrders.push(orderData);
                $scope.$apply();
            }
            $rootScope.progress = 100;
            $rootScope.progressBarText = "Order Created Successfully - Preparing Your Order";
        })

        // get role 
        $scope.getRole = function () {
            return utility.getRole();
        }

        $scope.getHeight = function (viewPortScale) {
            return (600 * Math.ceil(($scope.getAllOutletOrders.length) / viewPortScale)) + 200;
        }

        $scope.getOrders = function (status, type, page,limit) {
            if(type){
                $scope.currentOrderType = type;
            }
            if (status === "All") {
                status = undefined;
            }
            orderService
                .getAllOrders(status, type,undefined,page,limit)
                .then(function (data) {
                    $scope.getAllOutletOrders = data.orders;
                    $scope.totalOrders = data.totalOrders;
                    console.log($scope.totalOrders);
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

        $scope.viewDetails = function (index, assignedTable) {
            var brandData = brandService.getServiceData().brandData;
            
            if(brandData){
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
            blockUI.start();
            return outletService
                .getTables(1, 9, undefined)
                .then(function (data) {
                    $scope.tablesData = data.tables.filter(function (table) {
                        console.log(table.tableId, assignedTable);
                        return table.tableId !== parseInt(assignedTable);
                    });
                    utility.openModal(
                        'views/orders/displayModal.html',
                        'orderDetailsController',
                        'orderDisplayModal',
                        $scope,
                        {
                            currentIndex: index
                        },
                        $scope
                    );
                    blockUI.stop();
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                })
        }
    })

appModule.controller("orderDetailsController", function ($scope, utility, orderService) {

    var selectedOrder = $scope.$parent.getAllOutletOrders[$scope.$parent.extraData.currentIndex];

    $scope.selectedOrder = selectedOrder;

    $scope.orderedFoodItems = utility.categorizeItems(selectedOrder.orderedItems);

    $scope.tableToAssign = "None";
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
    $scope.updateOrder = function (orderId, categorizedOrderedItems, tableToAssign) {
        var orderedItems = utility.decategorizeItems(categorizedOrderedItems);
        $scope.isEditClicked = false;
        orderService
            .editOrder(orderId, orderedItems, tableToAssign)
            .then(function (data) {
                alert(data.message);
                $scope["orderDisplayModal"].close();
                return $scope.$parent.getOrders($scope.status,$scope.type);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.calculateAmount = function (items) {
        return utility.calculateAmount(items);
    }

    $scope.tables = $scope.$parent.tablesData;
})