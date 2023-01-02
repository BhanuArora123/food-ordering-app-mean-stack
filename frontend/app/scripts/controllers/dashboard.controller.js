

appModule.controller("dashboardController", function ($scope,$state, foodService,utility,permission) {
    
    $scope.getRole = utility.getRole;
    $scope.permissionAuthorizations = permission.getPermissionAuthorizations();

    // for displaying food items

    $scope.foodItemsToDisplay = [];
    $scope.getFoodItems = function (foodName, index) {
        // updating active class item 
        $scope.activeItem = index;
        foodService.getFoodItems({
            foodName: foodName
        })
            .then(function (foodData) {
                $scope.foodItemsToDisplay = foodData.matchedFoodItems;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    // get active class items
    $scope.activeItem = 0;
    $scope.getActiveClass = function (index) {
        return (index === $scope.activeItem) ? 'text-white text-decoration-underline' : 'text-secondary';
    }

    // display food item on window load
    $scope.onload = function () {
        console.log("hey!");
        $scope.getFoodItems("burger", 0);
    }

    $scope.getContent = function () {
        var role = utility.getRole();
        if(role === 'outlet'){
            return 'Order Now';
        }
        else if(role === 'brand'){
            return 'Manage Outlet Users';
        }
        else{
            return 'Manage Brands';
        }
    }

    $scope.contentAction = function () {
        var role = utility.getRole();
        if(role === 'outlet'){
            $state.go("home.food.display");
        }
        else if(role === 'brand'){
            $state.go("home.brand.display");
        }
        else{
            $state.go("home.admin.display");
        }
    }
})