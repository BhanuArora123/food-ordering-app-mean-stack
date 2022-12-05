

appModule.controller("foodController", function ($scope, foodService, outletService, foodItems, brandService, allCategories, utility, blockUI) {

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
    $scope.categories = allCategories;

    // getting user cart 
    var outletData = outletService.getServiceData().outletData;
    $scope.userCart = outletData ? outletData.cart : [];

    // display active category
    $scope.activeCategory = 0;
    $scope.activeSubcategory = 0;

    $scope.setActiveClass = function (index, type) {
        console.log(index);
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
            return ($scope.activeCategory === index) ? 'text-white bg-primary border-0' : 'text-dark';
        }
        else {
            return ($scope.activeSubcategory === index) ? 'text-white bg-primary border-0' : 'text-dark';
        }
    }

    // display food item
    $scope.getFoodItems = function () {
        $scope.foodItemsToDisplay = foodItems;
        return foodItems;
    }

    $scope.addFoodItems = function (food) {
        // attaching outlet id 
        var brandData = brandService.getServiceData().brandData;
        if (brandData) {
            food.brand = {
                id: brandData._id,
                name: brandData.name
            }
        }
        foodService
            .addFoodItem(food)
            .then(function (response) {
                alert("food item added successfully");
                return response;
            })
    }

    $scope.getFoodItem = function (data) {
        return foodService
            .getFoodItems({
                brandId: data.brandId
            })
            .then(function (data) {
                $scope.foodItemsToDisplay = utility.categorizeItems(data.matchedFoodItems);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.editFoodItem = function (food) {
        food.foodItemId = food._id;
        foodService
            .editFoodItem(food)
            .then(function () {
                $scope.editClicked = false;
                return $scope.getFoodItem();
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // delete food item 
    $scope.deleteFoodItem = function (food, parentIndex, grandParentIndex, index) {
        console.log(food);
        foodService
            .deleteFoodItem(food._id)
            .then(function () {
                $scope.foodItemsToDisplay[grandParentIndex].subCategoryItems[parentIndex].items.splice(index, 1);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // add to cart 
    $scope.addToCart = function (foodName, foodPrice, subCategory, category) {
        outletService
            .addToCart(foodName, foodPrice, outletData.name, category, subCategory)
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

    // remove from cart 
    $scope.removeFromCart = function (foodName) {
        outletService
            .removeFromCart(foodName)
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

    $scope.createCategory = function (category) {
        $scope.isCategorySelected = true;
        foodService.createCategory(category)
            .then(function (data) {
                return foodService
                    .getCategories()
            })
            .then(function (categories) {
                $scope.categories = categories.categories;
                $scope.noResults = false;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.getSubCategories = function (category) {
        $scope.isCategorySelected = true;
        $scope.food.subCategory = undefined;
        blockUI.start({
            message: "Fetching Sub Categories...."
        });
        return foodService.getSubCategories(category)
            .then(function (subCategories) {
                blockUI.stop();
                $scope.subCategories = subCategories;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.createSubCategory = function (subCategory, category) {
        return foodService
            .createSubCategory(subCategory, category)
            .then(function (data) {
                $scope.noSubCategory = false;
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

    // get role 
    $scope.getRole = function () {
        return utility.getRole();
    }

    $scope.setItemsForEditing = function (index) {
        $scope.editClicked = true;
        $scope.itemToEdit = index;
    }

    $scope.unsetItemsForEditing = function () {
        $scope.editClicked = false;
    }

})