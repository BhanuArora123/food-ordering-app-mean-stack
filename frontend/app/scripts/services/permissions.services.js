

appModule.factory("permission",function () {
    return {
        isAuthorized : function (currentPermissions,requiredPermissionId,allowedRoles,currentRole) {
            var isPermissionAuthorized = currentPermissions.find(function (permission) {
                return permission.permissionId === requiredPermissionId;
            });
            var isRoleAuthorized = allowedRoles.find(function (role) {
                return role === currentRole;
            })
            return isPermissionAuthorized && isRoleAuthorized;
        }
    }
})