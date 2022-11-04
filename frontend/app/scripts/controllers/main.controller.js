

// home controller
appModule.controller("homeController",function ($scope,$state) {
    $scope.logoutHandler = function () {
        localStorage.clear();
        $state.go("home.login");
    }
    
    // displaying menus based on navbar 
    $scope.getRole = function () {
        return localStorage.getItem("role");
    }
    $scope.getToken = function () {
        return localStorage.getItem("token");
    }
})