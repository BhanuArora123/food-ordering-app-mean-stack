


appModule.controller("brandsController", function ($scope, userData,outletService,brandService,allOutletAdmins, brandUsers, outletsData, utility, $rootScope, customersData, permission, customerService, userService) {
    var allCustomers = customersData.allCustomers;
    $scope.userData = userData;

    $scope.allCustomers = allCustomers;
    $scope.totalCustomers = customersData.totalCustomers;

    $scope.allOutlets = outletsData.allOutlets;
    $scope.totalOutlets = outletsData.totalOutlets;

    $scope.brandUsers = brandUsers.brandUsers;
    $scope.totalBrandUsers = brandUsers.totalBrandUsers;

    $scope.allOutletAdmins = allOutletAdmins.outletAdmins;
    $scope.totalOutletAdmins = allOutletAdmins.totalOutletAdmins;

    $scope.allowEdit = function () {
        $scope.isEditClicked = true;
    }

    $scope.disableEdit = function () {
        $scope.isEditClicked = false;
    }

    $scope.updatePassword = function (currentPassword, newPassword) {
        if (currentPassword === newPassword) {
            return alert("new password and current password must be different");
        }
        userService
            .updatePassword(currentPassword, newPassword)
            .then(function (data) {
                alert(data.message);
                $scope.isEditClicked = false;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.getOutletAdmins = function (page,outletId) {
        var brandId = userService.userData().brands[$rootScope.currentBrandIndex].id;
        return outletService.getOutletUsers(page, 9, outletId,"admin",brandId,outletId)
            .then(function (data) {
                $scope.allOutletAdmins = data.outletUsers;
                $scope.totalOutletAdmins = data.outletUsersCount;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    // editing outlets 
    $scope.makeEditable = function (index) {
        $scope.editElementIndex = index;
    }

    $scope.disableEditing = function () {
        $scope.editElementIndex = -1;
    }

    $scope.getOutlets = function (page,query) {
        var brandId = userService.userData().brands[$rootScope.currentBrandIndex].id;
        return outletService
            .getAllOutlets(page, 9,brandId,query)
            .then(function (data) {
                $scope.allOutlets = data.outlets;
                $scope.totalOutlets = data.totalOutlets;
                return data.outlets;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.updateAllotedOutlets = function (outletAdmin) {
        if(!outletAdmin.outlets && !outletAdmin.outlets.length){
            alert("there must be atleast one brand alloted to a admin");
            return ;
        }
        return userService.editUser(outletAdmin._id,{
            outletsToAllot:outletAdmin.outlets.map(function (outlet) {
                return {
                    id:outlet._id,
                    name:outlet.name,
                    brand:outlet.brand
                }
            }),
            currentUserRole:outletAdmin.role,
            role:outletAdmin.role,
            permissions:outletAdmin.permissions,
            userName:outletAdmin.name,
            userEmail:outletAdmin.email,
        })
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.getBrandUsers = function (page) {
        var brandId = userService.userData().brands[$rootScope.currentBrandIndex].id;
        return brandService.getBrandUsers(page, 9, brandId)
            .then(function (data) {
                $scope.brandUsers = data.brandUsers;
                $scope.totalBrandUsers = data.brandUsersCount;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    $scope.updateOutlet = function (outlet,disabled) {
        outlet.isDeleted = (disabled?true:false);
        return outletService
            .editOutlet(outlet)
            .then(function (data) {
                return data.message;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // permissions 
    $scope.getPermissions = function (role,subRoles) {
        console.log(permission.getPermissions(role,subRoles));
        return permission.getPermissions(role,subRoles);;
    };

    $scope.getRoles = function (role) {
        return permission.getRoles(role);
    }

    $scope.updatePermissions = function (user,userIndex) {
        // changing role make permission empty
        if(userIndex !== undefined){
            user.permissions = [];
            $scope.brandUsers[userIndex].permissions = [];
            return;
        }
        var updatePermissionDebounce = utility.debounce(2000, function () {
            userService
                .editUser(user._id,{
                    currentUserRole:user.role,
                    userEmail:user.email,
                    userName:user.name,
                    permissions:user.permissions,
                    role:user.role
                })
        })
        updatePermissionDebounce();
    }
    $scope.updateUser = function (userData) {
        return userService
            .editUser(userData._id,{
                userId:userData._id,
                currentUserRole:userData.role,
                brandsToAllot:userData.brands,
                outletsToAllot:userData.outlets,
                userEmail:userData.email,
                userName:userData.name,
                permissions: userData.permissions,
                role:userData.role,
            })
            .then(function (data) {
                return data.message;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    $scope.getCustomers = function (page) {
        customerService
            .getAllCustomers(page, 9)
            .then(function (data) {
                $scope.allCustomers = data.customers;
                $scope.totalCustomers = data.totalCustomers;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.sendInstruction = function (title, content) {
        brandService
            .sendInstructionsToOutlets(title, content)
    }
})