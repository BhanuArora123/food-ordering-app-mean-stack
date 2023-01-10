
appModule.controller("cartController", function ($scope, $rootScope, orderService, outletService, customerService, utility, offerService, socketService, $location, userService) {


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

    if ($location.url() !== "/orders/display") {
        socketService.recieveEvent("orderCreation", function (data) {
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
        if($scope.selectedCoupon){
            $scope.selectedCoupon.brand = {
                id:brandData.id,
                name:brandData.name
            };
        }
        return orderService.placeOrder($scope.customer, outletData, brandData, $scope.orderType, $scope.assignedTable, cart,[$scope.selectedCoupon])
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
        return utility.calculateAmount(Object.values(items),$scope.selectedCoupon?.discount);
    }

    $scope.setHeight = function () {
        var cart = Object.keys($scope.getCart());
        $scope.styleObj = {
            "height":(100 * cart.length + 800) + 'px'
        };
    }

    $scope.getApplicableCoupons = function (page, search) {
        var brandId = userService.userData().outlets[$rootScope.currentOutletIndex].brand.id;
        var outletId = userService.userData().outlets[$rootScope.currentOutletIndex].id;
        return offerService
            .getAllApplicableOffers(page, 9, brandId, outletId, $scope.customerId,$scope.orderType)
            .then(function (data) {
                console.log(data.applicableOffers);
                return data.applicableOffers;
            })
            .catch(function (error) {
                console.log(error);
            })
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
                    if (!data || !data.customerData) {
                        $scope.readOnlyCustomerName = false;
                        return;
                    }
                    console.log(data.customerData)
                    $scope.customer.name = data.customerData.name;
                    $scope.customerId = data.customerData._id;
                    $scope.readOnlyCustomerName = true;
                    $scope.getApplicableCoupons(1)
                })
                .catch(function (error) {
                    console.log(error);
                })
        })
        updatePermissionDebounce();
    }

    $scope.applyCoupon = function (offer) {
        var brandId = userService.userData().outlets[$rootScope.currentOutletIndex].brand.id;
        var outletId = userService.userData().outlets[$rootScope.currentOutletIndex].id;
        offerService
            .applyCoupon(offer._id, outletId, brandId, $scope.customerId,$scope.orderType)
            .then(function (data) {
                console.log($scope.amount);
                $scope.amount = utility.calculateAmount(Object.values($scope.getCart()),$scope.selectedCoupon.discount);
            })
            .catch(function (error) {
                $scope.selectedCoupon = {};
                console.log(error);
            })
    }
})