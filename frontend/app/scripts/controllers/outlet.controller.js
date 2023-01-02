

appModule.controller("outletController",function ($scope,$rootScope,NgTableParams,userData,tablesData,outletService,utility,orderService,userService,outletUsers,permission) {
    

    $scope.tablesTable = tablesData.tablesData;

    $scope.tablesData = tablesData.tablesData;
    $scope.totalTables = tablesData.totalTables;

    $scope.outletUsers = outletUsers.outletUsers;
    $scope.totalOutletUsers = outletUsers.totalOutletUsers;

    $scope.userData = userData;

    $scope.allowEdit = function () {
        $scope.isEditClicked = true;
    }
    
    $scope.disableEdit = function () {
        $scope.isEditClicked = false;
    }

    $scope.updatePassword = function (currentPassword,newPassword) {
        if(currentPassword === newPassword){
            return alert("new password and current password must be different");
        }
        userService
        .updatePassword(currentPassword,newPassword)
        .then(function (data) {
            alert(data.message);
            $scope.isEditClicked = false;
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.getTables = function (page) {
        outletService
        .getTables(page,9)
        .then(function (data) {
            $scope.tablesData = data.tables;
            $scope.totalTables = data.totalTables;
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.getOutletUsers = function (page) {
        var outletData = userService.userData().outlets[$rootScope.currentOutletIndex];
        return outletService.getOutletUsers(page, 9, outletData.id,undefined,outletData.brand.id)
            .then(function (data) {
                $scope.outletUsers = data.outletUsers;
                $scope.totalOutletUsers = data.outletUsersCount;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.addTableModal = function (page = 1) {
        outletService
        .addTable({
            tableId:$scope.totalTables + 1
        })
        .then(function (data) {
            return $scope.getTables(page,9);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    // open edit modal 
    $scope.openEditModal = function () {
        utility.openModal('views/outlet/editTable.html',"outletController","editTable",$scope,{},$scope)
    }

    // edit table 
    $scope.editTable = function (dataToUpdate) {
        orderService
        .editOrder(dataToUpdate.orderId,dataToUpdate.orderedIItems,dataToUpdate.tableToAssign)
        .then(function (data) {
            $scope.tablesData = data.tableData
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
})