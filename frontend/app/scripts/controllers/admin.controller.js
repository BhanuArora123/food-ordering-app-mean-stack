

appModule.controller("adminController", function ($scope, userService, allAdmins, brandService, adminData, brandsData, allBrandAdmins, blockUI, NgTableParams,permission) {
    // setting value for default value
    var allBrands = brandsData.allBrands;
    
    // displaying admin profile 
    $scope.adminData = adminData;

    // all brands
    $scope.allBrands = allBrands;
    $scope.totalBrands = brandsData.totalBrands;

    $scope.allBrandAdmins = allBrandAdmins.brandAdmins;
    $scope.totalBrandAdmins = allBrandAdmins.totalBrandAdmins;

    $scope.allAdmins = allAdmins.admins;
    $scope.totalAdmins = allAdmins.totalAdmins;

    $scope.allBrandsData = allBrandAdmins.brandAdmins;

    $scope.getBrands = function (page,query) {
        return brandService
        .getBrands(page,9,query)
        .then(function (data) {
            $scope.allBrands = data.brands;
            return data.brands;
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.getBrandAdmins = function (page,brandId) {
        return brandService.getBrandUsers(page, 9, brandId,"admin")
            .then(function (data) {
                $scope.allBrandAdmins = data.brandUsers;
                $scope.totalBrandAdmins = data.brandUsersCount;
                return data.brandUsers;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.updateAllotedBrands = function (brandAdmin) {
        if(!brandAdmin.brands.length){
            alert("there must be atleast one brand alloted to a admin");
            return ;
        }
        return userService.editUser(brandAdmin._id,{
            brandsToAllot:brandAdmin.brands.map(function (brand) {
                return {
                    id:brand._id,
                    name:brand.name
                }
            }),
            currentUserRole:brandAdmin.role,
            role:brandAdmin.role,
            permissions:brandAdmin.permissions,
            userName:brandAdmin.name,
            userEmail:brandAdmin.email,
        })
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.updateUser = function (userData) {
        return userService
            .editUser({
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

    // updating brand 
    // editing outlets 
    $scope.makeEditable = function (index) {
        $scope.editElementIndex = index;
    }

    $scope.disableEditing = function () {
        $scope.editElementIndex = -1;
    }

    $scope.updateBrand = function (brand) {
        return brandService
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
        brandService
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

    // admin permissions
    $scope.getAllAdmins = function (page = 1) {
        blockUI.start({
            message: "fetching admins"
        })
        userService
            .getAllAdmins(page,9)
            .then(function (data) {
                $scope.allAdmins = data.admins;
                $scope.totalAdmins = data.totalAdmins;
                blockUI.stop();
            })
            .catch(function (error) {
                console.log(error);
                blockUI.stop();
            })
    }
    // permissions 
    $scope.getPermissions = function (role,subRoles) {
        console.log(permission.getPermissions(role,subRoles));
        return permission.getPermissions(role,subRoles);;
    };
})