

// home controller
appModule.controller("homeController", function ($scope,$rootScope, $state, $uibModal,utility) {

    $scope.isNavCollapsed = (screen.width <= 765 );
    // dismiss alerts 
    $scope.closeError = function () {
        $rootScope.error = undefined;
    }

    $scope.closeSuccess = function () {
        $rootScope.success = undefined;
    }

    $scope.logoutHandler = function () {
        utility.logout();
    }

    // displaying menus based on navbar 
    $scope.getRole = function () {
        return utility.getRole();
    }
    $scope.getToken = function () {
        return localStorage.getItem("token");
    }
    $scope.getProfileState = function () {
        var role = utility.getRole();
        if(role === 'superAdmin'){
            role = 'admin';
        }
        return `home.${role}.display`;
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