

appModule.factory("auth", function ($q,$state,$rootScope,utility,permission) {
    return {
        isAuthenticated: function () {
            var token = localStorage.getItem("token");
            if (!token) {
                return $q.reject("Not Authenticated")
            }
            var currentUrl = $state.href($rootScope.toState.name);
            var role = utility.getRole();
            console.log("url - ",currentUrl);
            var permissionAuthorization = permission.getPermissionAuthorizations();
            if(new RegExp("/admin").test(currentUrl) && role !== "superAdmin" && role !== "admin"){
                return $q.reject("Not Authorized");
            }
            else if(new RegExp("/brand").test(currentUrl) && role !== "brand"){
                return $q.reject("Not Authorized");
            }
            else if(new RegExp("/outlet").test(currentUrl) && role !== "outlet"){
                return $q.reject("Not Authorized");
            }
            else if(new RegExp("/customer").test(currentUrl) && role !== "customer"){
                return $q.reject("Not Authorized");
            }
            else if(new RegExp("/reports").test(currentUrl) && !permissionAuthorization.manageAnalytics){
                return $q.reject("Not Authorized");
            }
            else if(new RegExp("/food").test(currentUrl) && !permissionAuthorization.manageDishes){
                return $q.reject("Not Authorized");
            }
            else if(new RegExp("/order").test(currentUrl) && !permissionAuthorization.manageOrdersBrand && !permissionAuthorization.manageOrdersOutlet){
                return $q.reject("Not Authorized");
            }
        }
    }
})