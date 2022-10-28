

// home controller
appModule.controller("homeController",function ($scope,$state) {
    $scope.logoutHandler = function () {
        localStorage.removeItem("token");
        $state.go("home.login");
    }
})