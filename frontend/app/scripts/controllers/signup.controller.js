

appModule.controller("signupController",function ($scope,userService,adminService,outletService) {

    $scope.signupHandler = function (name,email,password,userRole = "User") {
        if(userRole === "User"){
            userService
            .signup(name,email,password)
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
        }
        else if(userRole === "Outlet"){
            outletService
            .signup(name,email,password)
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
        }
        else{
            adminService
            .signup(name,email,password,"admin")
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
        }
    }

})