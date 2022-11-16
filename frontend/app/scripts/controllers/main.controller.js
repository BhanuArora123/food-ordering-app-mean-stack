

// home controller
appModule.controller("homeController", function ($scope,$rootScope, $state, $uibModal) {

    $scope.logoutHandler = function () {
        localStorage.clear();
        $state.go("home.login");
    }

    // displaying menus based on navbar 
    $scope.getRole = function () {
        return localStorage.getItem("role");
    }
    $scope.getToken = function () {
        return localStorage.getItem("token");
    }

    // open modal for cart 
    $rootScope.openModal = function (templateUrl,controller,instanceName,scope,extraData) {
        // console.log("hello");
        if(scope){
            scope.extraData = extraData;
        }
        var modalInstance = $uibModal.open({
            backdrop:true,
            controller:controller,
            scope:scope?scope:$scope,
            templateUrl:templateUrl,
            windowClass: 'show bg-transparent',
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            backdropClass:"opacity-medium"
        })
        $scope[instanceName] = modalInstance;
    }


});