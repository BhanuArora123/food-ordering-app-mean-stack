

// home controller
appModule.controller("homeController", function ($scope,$rootScope, userService,socketService, userData, $uibModal,utility,permission) {

    $rootScope.permissionAuthorizations = permission.getPermissionAuthorizations();
    var outletsData = userService.userData()?.outlets;
    if (outletsData && outletsData[$rootScope.currentOutletIndex]) {
      socketService.emitEvent("connectOutlet", {
        brandId: outletsData[0].brand.id
      })
    }

    // order creation progress bar 
    $rootScope.max = 100;
    $rootScope.progress = 0;

    // switch brand conf.
    $rootScope.userOutlets = userData?.outlets;
    $rootScope.userBrands = userData?.brands;
    
    $scope.userData = userData;
    $scope.currentBrand = "brand5999";
    
    $rootScope.closeProgressBar = function () {
        $rootScope.displayProgressBar = false;
        $rootScope.progress = 100;
    }
    // dismiss alerts 
    $scope.closeError = function () {
        $rootScope.error = undefined;
    }

    $scope.closeSuccess = function () {
        $rootScope.success = undefined;
    }

    $scope.logoutHandler = function () {
        $rootScope.userRole = undefined;
        permission.unsetAllAuthorizations();
        $rootScope.permissionAuthorizations = permission.getPermissionAuthorizations();
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
        if(role !== 'brand' && role !== 'outlet'){
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

    $scope.isAuthorized = function (requiredPermissionId,allowedRoles) {
        var userData = (userService.userData());
        if(!userData){
            return false;
        }
        var userPermissions = userData.permissions;
        var role = userData.role.name;
        return permission.isAuthorized(userPermissions,requiredPermissionId,allowedRoles,role);
    }

});