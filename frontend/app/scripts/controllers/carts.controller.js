
appModule.controller("cartController", function ($scope, orderService, outletService, customerService, utility, permission) {


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
        var outletData = outletService.getServiceData().outletData;
        var brandData = outletData ? outletData.brand : {};
        var cart = Object.values($scope.getCart());
        return orderService.placeOrder($scope.customer, outletData, brandData, $scope.orderType, $scope.assignedTable,cart)
            .then(function (data) {
                alert("order created successfully :)");
                return data.orderData;
            })
            .then(function () {
                $scope.$parent.cartModal.close();
                return outletService.getOutletData();
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
        var updatePermissionDebounce = utility.debounce(1000, function () {
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
        var outletData = outletService.getServiceData().outletData;
        if (!outletData) {
            return false;
        }
        var userPermissions = outletData.permissions;
        var role = localStorage.getItem("role");
        return permission.isAuthorized(userPermissions, requiredPermissionId, allowedRoles, role);
    }
})