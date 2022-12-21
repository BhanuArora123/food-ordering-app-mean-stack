

appModule.controller("loginSignupController", function ($scope,$state, brandService, adminService, outletService,role,utility) {

    //default user role in login 
    $scope.login = {
        userRole:"Outlet"
    }

    $scope.signup = {
        userRole:role?role.charAt(0).toUpperCase() + role.substring(1):"superAdmin"
    }

    $scope.role = role;

    $scope.roles = ["superAdmin","admin"];

    $scope.getUserPermissions = function (role) {
        console.log(utility.getPermissions(role));
        return utility.getPermissions(role);
    };
    // login handler 
    $scope.loginHandler = function (email, password, userRole = "Outlet") {
        console.log(userRole);
        if (userRole === "Outlet") {
            outletService
                .login(email, password)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
        else if (userRole === "Brand") {
            brandService
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

    // signup handler 

    $scope.signupHandler = function (name,email,userRole = "Outlet") {
        var permissions = $scope.signup.permissions;
        if(userRole === "Outlet"){
            outletService
            .signup(name,email,permissions)
            .then(function (response) {
                $state.go("home.dashboard");
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
        }
        else if(userRole === "Brand"){
            brandService
            .signup(name,email,permissions)
            .then(function (response) {
                $state.go("home.dashboard");
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
        }
        else{
            adminService
            .signup(name,email,$scope.signup.role,permissions)
            .then(function (response) {
                $state.go("home.dashboard");
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
        }
    }

    // active path handlers
    $scope.activePath = 'login';

    $scope.onActivePath = function (path) {
        return $scope.activePath === path;
    }

    $scope.setActivePath = function (path) {
        $scope.activePath = path;
    }
    // get active css class 
    $scope.getActiveCssClass = function (path) {
        var cssClass = $scope.onActivePath(path)?"fw-bold h3 text-decoration-underline text-white":"text-secondary";
        return cssClass;
    }
})

appModule.controller("customerLoginController",function ($scope,$state,customerService) {
    $scope.customerLoginHandler = function (phoneNumber) {
        customerService
        .customerLogin(phoneNumber)
        .then(function (data) {
            $state.go("home.customer.dashboard");
        })
        .catch(function (error) {
            console.log(error);
        })
    }
})