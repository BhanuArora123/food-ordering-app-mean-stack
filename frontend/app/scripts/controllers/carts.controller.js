
appModule.controller("cartController", function ($scope, $rootScope, orderService, outletService, customerService, utility, permission, socketService,$location,userService) {


    (function () {
        outletService
            .getTables(1, 9, false)
            .then(function (data) {
                $scope.tables = data.tables;
            })
            .catch(function (error) {
                console.log(error);
            })
    })()

    // binding assignedTable 

    if($location.url() !== "/orders/display"){
        socketService.recieveEvent("orderCreation",function (data) {
            $rootScope.progress = 100;
            $rootScope.progressBarText = "Order Created Successfully - Preparing Your Order";
        })
    }

    $scope.assignedTable = "None";

    // binding cart data to scope 

    $scope.customer = {
        paidVia: "Card"
    }

    $scope.orderType = "Dine In";

    $scope.getCart = function () {
        return outletService.getCart();
    }

    $scope.getCartLength = function (cart) {
        return Object.values(cart).length;
    }

    // place order 
    $scope.placeOrder = function () {
        var userData = userService.userData();
        var brandData = userData.brands ? userData.brands[$rootScope.currentBrandIndex] : userData.outlets[$rootScope.currentOutletIndex].brand;
        var outletData = userData.outlets ? userData.outlets[$rootScope.currentOutletIndex] : undefined;
        var cart = Object.values($scope.getCart());
        return orderService.placeOrder($scope.customer, outletData, brandData, $scope.orderType, $scope.assignedTable,cart)
            .then(function (data) {
                $rootScope.progressBarText = data.message;
                $rootScope.displayProgressBar = true;
                $scope.$parent.cartModal.close();
                return data.orderData;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.calculateAmount = function (items) {
        console.log(Object.values(items));
        console.log(items);
        return utility.calculateAmount(Object.values(items));
    }

    $scope.setHeight = function () {
        var cart = $scope.getCart();

        return (100 * cart.length + 700) + 'px;';
    }

    $scope.getCustomerData = function (phoneNumber) {
        if (phoneNumber.toString().length !== 10) {
            $scope.readOnlyCustomerName = false;
            return;
        }
        var updatePermissionDebounce = utility.debounce(500, function () {
            customerService
                .getCustomerByPhone(phoneNumber)
                .then(function (data) {
                    if (!data.customerData) {
                        $scope.readOnlyCustomerName = false;
                        return;
                    }
                    console.log(data.customerData)
                    $scope.customer.name = data.customerData.name;
                    $scope.readOnlyCustomerName = true;
                })
                .catch(function (error) {
                    console.log(error);
                })
        })
        updatePermissionDebounce();
    }

    $scope.isAuthorized = function (requiredPermissionId, allowedRoles) {
        var userData = userService.userData();
        var outletData = userData.outlets[$rootScope.currentOutletIndex];
        if (!outletData) {
            return false;
        }
        var userPermissions = userData.permissions;
        var role = utility.getRole();
        return permission.isAuthorized(userPermissions, requiredPermissionId, allowedRoles, role);
    }
})