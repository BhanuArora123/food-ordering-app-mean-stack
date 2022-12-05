

appModule.controller("outletController",function ($scope,NgTableParams,outletData,tablesData,outletService,utility,orderService) {
    
    console.log(tablesData);

    $scope.tablesTable = new NgTableParams({},{
        dataset:tablesData
    })

    $scope.tablesData = tablesData;

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
        outletService
        .updatePassword(currentPassword,newPassword)
        .then(function (data) {
            alert(data.message);
            $scope.isEditClicked = false;
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    $scope.openAddTableModal = function () {
        outletService
        .addTable({
            tableId:$scope.tablesData.length + 1
        })
        .then(function (data) {
            $scope.tablesData = data.tables;
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