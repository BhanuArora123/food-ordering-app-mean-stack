
appModule.controller("cartController",function ($scope,orderService,outletService) {
    
    // binding cart data to scope 

    $scope.customer = {
        paidVia:"Card"
    }

    $scope.getCart = function () {
        return outletService.getServiceData()?outletService.getServiceData().outletData.cart:[];
    }

    // place order 
    $scope.placeOrder = function () {
        var outletData = outletService.getServiceData().outletData;
        var brandData = outletData?outletData.brand:{};
        return orderService.placeOrder($scope.customer,outletData,brandData)
        .then(function (data) {
            alert("order created successfully :)");
            return data.orderData;
        })
        .then(function () {
            $scope.$parent.cartModal.close();
            return outletService.getUserData();
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.setHeight = function () {
        var cart = $scope.getCart();

        return (100*cart.length + 300) + 'px;';
    }
})