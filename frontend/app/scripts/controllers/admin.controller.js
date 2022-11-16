

appModule.controller("adminController",function ($scope,outletService,adminService,brandService) {
    // setting value for default value
    $scope.signup = {
        userRole:"Brand"
    }
    
    $scope.signupHandler = function (name,email,password,userRole = "Outlet") {
        if(userRole === "Outlet"){

            var brandData = brandService.getServiceData().brandData;

            outletService
            .signup(name,email,password,brandData)
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
        }
        else if(userRole === "Brand"){
            brandService
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