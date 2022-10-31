

appModule.controller("foodController",function ($scope,$location,foodService,outletService,adminService,$state) {

    // adding food items 

    // (function () {
    //     var currentPath = $location.path();
    //     var role = outletService.outletData.role || adminService.adminData.role;
    //     if((currentPath === '/food/add' || currentPath === '/food/edit') &&  role !== "admin" && role !== "superAdmin" && role !== "outlet"){
    //         alert("access denied! you are being redirect to food display page");
    //         $state.go("home.food.display");
    //     }
    // })()

    $scope.addFoodItems = function (food) {
        // attaching outlet id 
        var outletId = outletService.getServiceData().outletData._id;
        if(outletId){
            food.outletId = outletId;
        }
        foodService
        .addFoodItem(food)
        .then(function (response) {
            // console.log(response.data);
            alert("food item added successfully");
            return response;
        })
    }

    $scope.updateCurrentFile = function (eve) {
        console.log(eve);
    }
})