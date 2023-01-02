

appModule.controller("loginSignupController", function ($scope, $rootScope, $state,adminCount, userService,outletService, params, permission,utility, brandService) {

    var role = params.role;
    var subRole = params.subRole;
    $scope.role = role;

    $scope.subRole = subRole;

    $scope.adminCount = adminCount;

    $scope.roles = permission.getRoles(role);

    $scope.getUserPermissions = function (subRoles) {
        if (!role) {
            return;
        }
        $scope.permissions = permission.getPermissions(role, subRoles);
        console.log("permission",permission.getPermissions(role, subRoles));
    };
    // login handler 
    $scope.loginHandler = function (email, password) {
        userService
            .login({
                email: email,
                password: password
            })
            .then(function (data) {
                utility.setPermissionAuthorization();
                $rootScope.permissionAuthorizations = permission.getPermissionAuthorizations();
                $rootScope.userOutlets = data.userData.outlets;
                $rootScope.userBrands = data.userData.brands;
                $rootScope.currentBrandIndex = 0;
                $rootScope.currentOutletIndex = 0;
                $state.go("home.dashboard");
            })
            .catch(function (error) {
                console.log(error)
            })
    }
    $scope.getBrands = function (query) {
        return brandService
            .getBrands(1,9,query)
            .then(function (data) {
                return data.brands.map(function (brand) {
                    return {
                        id:brand._id,
                        name:brand.name,
                    };
                });
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.getOutlets = function (query,brandId) {
        var userData = userService.userData();
        var brandData = userData.brands?userData.brands[$rootScope.currentBrandIndex]:undefined;
        if(!brandData){
            return [];
        }
        return outletService
            .getAllOutlets(1, 9, brandData.id,query)
            .then(function (data) {
                $scope.availableOutlets = data.outlets;
                return data.outlets.map(function (outlet) {
                    return {
                        id:outlet._id,
                        name:outlet.name,
                        brand:outlet.brand
                    };
                });
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    // signup handler 

    $scope.signupHandler = function (name, email, role, subRoles, permissions, password,selectedBrand,selectedOutlet) {
        var userData = userService.userData();
        var brandData, outletData;
        if (userData.brands || selectedBrand) {
            brandData = userData.brands?userData.brands[$rootScope.currentBrandIndex]:selectedBrand;
        }
        if (userData.outlets || selectedOutlet) {
            outletData = userData.outlets?userData.outlets[$rootScope.currentOutletIndex]:selectedOutlet;
        }
        console.log(outletData);
        userService
            .signup({
                name: name,
                email: email,
                role: {
                    name: role,
                    subRoles: subRoles
                },
                permissions: permissions,
                password: password,
                brand: {
                    id: brandData ? brandData.id : undefined,
                    brandName: brandData ? brandData.name : name
                },
                outlet: {
                    name: outletData ? outletData.name : name,
                    id: outletData ? outletData.id : undefined,
                    brand: outletData ?
                        {
                            id: outletData.brand.id,
                            name: outletData.brand.name
                        }
                        :
                        (
                            brandData ? {
                                id: brandData.id,
                                name:brandData.name
                            }:undefined
                        )
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
        if(!role){
            return ;
        }
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