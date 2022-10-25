

appModule.controller("loginController", function ($scope, userService, adminService, outletService) {
    $scope.loginHandler = function (email, password, userRole = "User") {
        if (userRole === "User") {
            userService
                .login(email, password)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
        else if (userRole === "Outlet") {
            outletService
                .login(email, password)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
        else {
            adminService
                .login(email, password)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }
})