
appModule.controller("cartController",function ($scope,orderService,outletService,customerService,utility) {
    

    (function () {
        outletService
        .getTables(1,9,false)
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
        paidVia:"Card"
    }

    $scope.orderType = "Take Away";

    $scope.getCart = function () {
        return outletService.getServiceData()?outletService.getServiceData().outletData.cart:[];
    }

    // place order 
    $scope.placeOrder = function () {
        var outletData = outletService.getServiceData().outletData;
        var brandData = outletData?outletData.brand:{};
        return orderService.placeOrder($scope.customer,outletData,brandData,$scope.orderType,$scope.assignedTable)
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
        return utility.calculateAmount(items)
    }

    $scope.setHeight = function () {
        var cart = $scope.getCart();

        return (100*cart.length + 700) + 'px;';
    }

    $scope.getCustomerData = function (phoneNumber) {
        if(phoneNumber.toString().length !== 10){
            $scope.readOnlyCustomerName = false;
            return;
        }
        customerService
        .getCustomerByPhone(phoneNumber)
        .then(function (data) {
            if(!data.customerData){
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
    }
})