

appModule.controller("adminController", function ($scope, outletService, adminService, brandService, adminData, allBrands, blockUI, NgTableParams, utility,permission) {
    // setting value for default value
    $scope.signup = {
        userRole: "Brand"
    }

    $scope.signupHandler = function (name, email, password, userRole = "Outlet") {
        if (userRole === "Outlet") {

            var brandData = brandService.getServiceData().brandData;

            outletService
                .signup(name, email, password, brandData)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
        else if (userRole === "Brand") {
            brandService
                .signup(name, email, password)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
        else {
            adminService
                .signup(name, email, password, "admin")
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }

    // displaying admin profile 
    $scope.adminData = adminData;

    // all brands
    $scope.allBrands = allBrands;

    $scope.allBrandsData = new NgTableParams({}, {
        dataset: allBrands
    })

    // editing password 
    $scope.allowEdit = function () {
        $scope.isEditClicked = true;
    }

    $scope.disableEdit = function () {
        $scope.isEditClicked = false;
    }

    $scope.updatePassword = function (currentPassword, newPassword) {
        if (currentPassword === newPassword) {
            return alert("new password and current password must be different!");
        }
        adminService
            .updatePassword(currentPassword, newPassword)
            .then(function (data) {
                alert(data.message);
                $scope.isEditClicked = false;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // updating brand 
    // editing outlets 
    $scope.makeEditable = function (index) {
        $scope.editElementIndex = index;
    }

    $scope.disableEditing = function () {
        $scope.editElementIndex = -1;
    }

    $scope.updateBrand = function (brand) {
        return adminService
            .editBrand(brand)
            .then(function (data) {
                $scope.editElementIndex = -1;
                return data.message;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.toggleBrandAccess = function (brand) {
        console.log(brand);
        adminService
            .editBrand({
                _id: brand._id,
                isDisabled: !brand.isDisabled
            })
            .then(function () {
                brand.isDisabled = !(brand.isDisabled);
                alert(`brand ${brand.isDisabled ? "disabled" : "enabled"} successfully!`);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.getPermissions = function (role) {
        return utility.getPermissions(role);
    }

    $scope.updatePermissions = function (userId, permissions, type) {
        var updatePermissionDebounce = utility.debounce(2000,function () {
            if (type === 'brand') {
                brandService.editPermissions({
                    brandId: userId,
                    permissions: permissions
                })
            }
            else {
                adminService
                    .editPermissions({
                        adminId: userId,
                        permissions: permissions
                    })
            }
        })
        updatePermissionDebounce();
    }

    // admin permissions
    $scope.getAllAdmins = function () {
        blockUI.start({
            message: "fetching admins"
        })
        adminService
            .getAllAdmins()
            .then(function (data) {
                $scope.allAdmins = data.admins;
                blockUI.stop();
            })
            .catch(function (error) {
                console.log(error);
                blockUI.stop();
            })
    }
    $scope.isAuthorized = function (currentPermissions,requiredPermissionId,role) {
        var allowedRoles = ["superAdmin","admin"];
        return permission.isAuthorized(currentPermissions,requiredPermissionId,allowedRoles,role);
    }
})