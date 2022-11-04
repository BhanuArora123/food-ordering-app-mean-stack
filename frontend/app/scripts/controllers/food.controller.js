

appModule.controller("foodController", function ($scope, foodService, outletService, foodItems, userService) {

    // adding food items 

    // (function () {
    //     var currentPath = $location.path();
    //     var role = outletService.outletData.role || adminService.adminData.role;
    //     if((currentPath === '/food/add' || currentPath === '/food/edit') &&  role !== "admin" && role !== "superAdmin" && role !== "outlet"){
    //         alert("access denied! you are being redirect to food display page");
    //         $state.go("home.food.display");
    //     }
    // })()

    var userData = JSON.parse(userService.getServiceData().userData);
    $scope.foodItemsToDisplay = foodItems;
    $scope.userCart = userData?userData.cart:[];
    // display food item
    $scope.getFoodItems = function () {
        $scope.foodItemsToDisplay = foodItems;
        return foodItems;
    }

    $scope.addFoodItems = function (food) {
        // attaching outlet id 
        var outletData = outletService.getServiceData().outletData;
        var outletName = outletData?outletData.name:undefined;
        console.log(outletName);
        if (outletName) {
            food.outletName = outletName;
        }
        foodService
            .addFoodItem(food)
            .then(function (response) {
                // console.log(response.data);
                alert("food item added successfully");
                return response;
            })
    }

    // add to cart 
    $scope.addToCart = function (foodName, foodPrice, outletName) {
        userService
            .addToCart(foodName, foodPrice, outletName)
            .then(function (response) {
                console.log(response.cartData);
                $scope.userCart = response.cartData;
                // $scope.$apply();
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // check if item present in cart 
    $scope.presentInCart = function (foodName,outletName) {
        return $scope.userCart.find(function (cartItem) {
            return (cartItem.foodName === foodName && cartItem.outletName === outletName);
        })
    }

    
})