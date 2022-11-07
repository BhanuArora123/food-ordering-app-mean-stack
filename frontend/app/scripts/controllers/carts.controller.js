
appModule.controller("cartController",function ($scope,userService) {
    
    // binding cart data to scope 

    $scope.getCart = function () {
        return userService.getServiceData()?JSON.parse(userService.getServiceData().userData).cart:[];
    }

    // place order 
    $scope.placeOrder = function () {
        return userService.placeOrder()
        .then(function (data) {
            alert("order created successfully :)");
            return data.orderData;
        })
        .then(function (orderData) {
            return userService.getUserData();
        })
        .catch(function (error) {
            console.log(error);
        })
    }
})