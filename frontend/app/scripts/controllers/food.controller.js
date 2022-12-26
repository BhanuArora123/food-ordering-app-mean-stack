

appModule.controller("foodController", function ($scope,$state, foodService, outletService, allCategories, utility, blockUI, availableTaxes, permission, availableCategories, userService) {

    $scope.foodItemsToDisplay = [];
    $scope.availableCategories = availableCategories;
    $scope.categories = allCategories;

    // getting user cart 
    var userData = userService.userData();
    var outletData = userData.outlets?userData.outlets[0]:undefined;
    $scope.userCart = outletService.getCart();

    // display active category
    $scope.activeCategory = 0;
    $scope.activeSubcategory = 0;

    $scope.setActiveClass = function (index, type) {
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
            return ($scope.activeCategory === index) ? 'text-dark bg-light border-0' : 'text-white';
        }
        else {
            return ($scope.activeSubcategory === index) ? 'text-dark bg-light border-0' : 'text-white';
        }
    }

    $scope.addFoodItems = function (food) {
        // attaching outlet id 
        var userData = userService.userData();
        if (userData.brands) {
            food.brand = {
                id: userData.brands[0]._id,
                name: userData.brands[0].name
            }
        }
        foodService
            .addFoodItem(food)
            .then(function (response) {
                $state.go("home.dashboard");
                return response;
            })
    }

    $scope.getFoodItems = function (category,subCategory,index,type) {
        console.log(category,subCategory,index,type);
        $scope.setActiveClass(index,type);
        if(type === 'category'){
            $scope.foodPagination = Array(availableCategories[index].length).fill(1);
        }
        return foodService
            .getFoodItems({
                category:category,
                subCategory:subCategory,
                page:(type === 'category'?1:$scope.foodPagination[index]),
                limit:9
            })
            .then(function (data) {
                $scope.foodItemsToDisplay = data.matchedFoodItems;
                $scope.totalFoodItems = data.totalFoodItems;
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
                return $scope.getFoodItems();
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
    $scope.addToCart = function (foodName, foodPrice, subCategory, category, taxes, foodItemId) {
        $scope.userCart = outletService
            .addToCart(foodItemId, {
                foodName: foodName,
                foodPrice: foodPrice,
                outletName: outletData.name,
                category: category,
                subCategory: subCategory,
                taxes: taxes
            });
    }

    // remove from cart 
    $scope.removeFromCart = function (foodItemId) {
        $scope.userCart = outletService
            .removeFromCart(foodItemId)
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
    $scope.presentInCart = function (foodItemId) {
        return $scope.userCart[foodItemId];
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

    $scope.taxesAvailable = availableTaxes;

    $scope.openTaxModal = function () {
        utility.openModal('views/taxes/index.html', "taxController", "taxModal", $scope, {}, $scope);
    }

    $scope.isAuthorized = function (requiredPermissionId, allowedRoles) {
        if (!outletData) {
            return false;
        }
        var userPermissions = outletData.permissions;
        var role = localStorage.getItem("role");
        return permission.isAuthorized(userPermissions, requiredPermissionId, allowedRoles, role);
    }
})