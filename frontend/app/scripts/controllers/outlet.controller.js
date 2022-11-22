

appModule.controller("outletController",function ($scope,NgTableParams,outletData,tablesData,outletService,utility) {
    
    console.log(tablesData);

    this.tablesTable = new NgTableParams({},{
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

    $scope.updateProfile = function (outletData) {
        outletService
        .editOutlet(outletData)
        .then(function (data) {
            $scope.outletData = data.outletData;
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
})