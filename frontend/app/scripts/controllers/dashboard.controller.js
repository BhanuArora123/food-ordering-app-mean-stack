

appModule.controller("dashboardController", function ($scope,foodService) {

    // for displaying food items
    $scope.foodItemsToDisplay = [];
    $scope.getFoodItems = function (foodName,index) {
        // updating active class item 
        $scope.activeItem = index;
        foodService.getFoodItems({
            foodName:foodName
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
        return (index === $scope.activeItem)?'text-white text-decoration-underline':'text-secondary';
    }
})