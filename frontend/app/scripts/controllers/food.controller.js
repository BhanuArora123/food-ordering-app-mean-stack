

appModule.controller("foodController", function ($scope, foodService, outletService, foodItems, brandService, allCategories,utility) {

    // adding food items 

    // (function () {
    //     var currentPath = $location.path();
    //     var role = outletService.outletData.role || adminService.adminData.role;
    //     if((currentPath === '/food/add' || currentPath === '/food/edit') &&  role !== "admin" && role !== "superAdmin" && role !== "outlet"){
    //         alert("access denied! you are being redirect to food display page");
    //         $state.go("home.food.display");
    //     }
    // })()

    $scope.foodItemsToDisplay = utility.categorizeItems(foodItems);
    console.log($scope.foodItemsToDisplay);
    $scope.categories = allCategories;
    $scope.subCategories = [];

    // getting user cart 
    (function () {
        var outletData = outletService.getServiceData().outletData;
        $scope.userCart = outletData ? outletData.cart : [];
    })()

    // display active category
    $scope.activeCategory = 0;
    $scope.activeSubcategory = 0;

    $scope.setActiveClass = function (index,type) {
        console.log(index);
        if(type === 'category'){
            $scope.activeCategory = index;
            $scope.activeSubcategory = 0;
        }
        else{
            $scope.activeSubcategory = index;
        }
    }

    $scope.getActiveClass = function (index,type) {
        if(type === 'category'){
            return ($scope.activeCategory === index)?'':'opacity-low';
        }
        else{
            return ($scope.activeSubcategory === index)?'':'opacity-low';
        }
    }

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
        var brandData = brandService.getServiceData().brandData;
        if (brandData) {
            food.brand = {
                id:brandData._id,
                name:brandData.name
            }
        }
        foodService
            .addFoodItem(food)
            .then(function (response) {
                alert("food item added successfully");
                return response;
            })
    }

    // add to cart 
    $scope.addToCart = function (foodName, foodPrice, outletName,subCategory,category) {
        outletService
            .addToCart(foodName, foodPrice, outletName,category,subCategory)
            .then(function (response) {
                console.log(response.cartData);
                $scope.userCart = response.cartData;
            })
            .then(function () {
                return outletService.getOutletData();
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.getSubCategories = function () {
        var category = $scope.food.category;
        return foodService.getSubCategories(category)
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