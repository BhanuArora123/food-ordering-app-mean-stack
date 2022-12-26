

appModule.controller("outletController",function ($scope,NgTableParams,outletData,tablesData,outletService,utility,orderService,userService,outletUsers) {
    

    $scope.tablesTable = new NgTableParams({},{
        dataset:tablesData.tablesData
    })

    $scope.tablesData = tablesData.tablesData;
    $scope.totalTables = tablesData.totalTables;

    $scope.outletUsers = outletUsers.outletUsers;
    $scope.totalOutletUsers = outletUsers.totalOutletUsers;

    $scope.outletData = outletData;

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
        var outletId = userService.userData().outlets[0].id;
        return outletService.getOutletUsers(page, 9, outletId)
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
})