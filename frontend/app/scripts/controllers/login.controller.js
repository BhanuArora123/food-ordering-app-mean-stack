

appModule.controller("loginSignupController", function ($scope, $state, userService, role, utility,permission) {

    $scope.role = role;

    $scope.adminCount = 4;

    $scope.roles = permission.getRoles(role);

    $scope.getUserPermissions = function (subRoles) {
        if(!role){
            return;
        }
        $scope.permissions = permission.getPermissions(role,subRoles);
        console.log(permission.getPermissions(role,subRoles));
    };
    // login handler 
    $scope.loginHandler = function (email, password) {
        userService
            .login({
                email:email,
                password:password
            })
            .then(function (response) {
                $state.go("home.dashboard")
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    // signup handler 

    $scope.signupHandler = function (name, email, role, subRoles, permissions, password) {
        var userData = userService.userData();
        var brandData,outletData;
        if(userData.brands){
            brandData = userData.brands[0];
        }
        if(userData.outlets){
            outletData = userData.outlets[0];
        }
        userService
            .signup({
                name: name,
                email: email,
                role: {
                    name:role,
                    subRoles:subRoles
                },
                permissions: permissions,
                password: password,
                brand: {
                    id:brandData?brandData._id:undefined,
                    brandName:brandData?brandData.name:name
                },
                outlet: {
                    name:outletData?outletData.name:name,
                    id:outletData?outletData._id:undefined,
                    brand:brandData?{
                        id:brandData._id,
                        name:brandData.name
                    }:undefined
                }
            })
            .then(function (response) {
                $state.go("home.dashboard");
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            })
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
        var cssClass = "fw-bold h3 text-decoration-underline text-white";
        return cssClass;
    }

    $scope.capitalize = function (role) {
        return role.charAt(0).toUpperCase() + role.substring(1);
    }
})

appModule.controller("customerLoginController", function ($scope, $state, customerService) {
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