

appModule.controller("foodController", function ($scope, foodService, outletService, foodItems, userService, allCategories) {

    // adding food items 

    // (function () {
    //     var currentPath = $location.path();
    //     var role = outletService.outletData.role || adminService.adminData.role;
    //     if((currentPath === '/food/add' || currentPath === '/food/edit') &&  role !== "admin" && role !== "superAdmin" && role !== "outlet"){
    //         alert("access denied! you are being redirect to food display page");
    //         $state.go("home.food.display");
    //     }
    // })()


    $scope.foodItemsToDisplay = foodItems;
    $scope.categories = allCategories;
    $scope.subCategories = [];
    // getting user cart 
    (function () {
        var userData = JSON.parse(userService.getServiceData().userData);
        $scope.userCart = userData ? userData.cart : [];
    })()
    // display food item
    $scope.getFoodItems = function () {
        $scope.foodItemsToDisplay = foodItems;
        return foodItems;
    }

    $scope.createCategory = function (category) {
        foodService.createCategory(category)
            .then(function (data) {
                return foodService
                    .getCategories()
            })
            .then(function (categories) {
                $scope.categories = categories;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.addFoodItems = function (food) {
        // attaching outlet id 
        var outletData = outletService.getServiceData().outletData;
        var outletName = outletData ? outletData.name : undefined;
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
    $scope.addToCart = function (foodName, foodPrice, outletName,subCategory,category) {
        userService
            .addToCart(foodName, foodPrice, outletName,category,subCategory)
            .then(function (response) {
                console.log(response.cartData);
                $scope.userCart = response.cartData;
            })
            .then(function () {
                return userService.getUserData();
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.getSubCategories = function () {
        return foodService.getSubCategories($scope.food.category)
        .then(function (data) {
            $scope.subCategories = data.subCategories.map(function (subCategory) {
                return subCategory.name;
            });
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.createSubCategory = function (subCategory,category) {
        return foodService
        .createSubCategory(subCategory,category)
        .then(function (data) {
            $scope.getSubCategories();
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    // check if item present in cart 
    $scope.presentInCart = function (foodName, outletName) {
        return $scope.userCart.find(function (cartItem) {
            return (cartItem.foodName === foodName && cartItem.outletName === outletName);
        })
    }

})