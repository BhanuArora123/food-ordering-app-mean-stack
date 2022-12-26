

appModule.factory("permission",function () {
    var permissions = {
        admin:{
            superAdmin:[
                {
                    permissionId:1,
                    permissionName:'Manage Admin'
                },
                {
                    permissionId:2,
                    permissionName:'Manage Brand'
                },
                {
                    permissionId:3,
                    permissionName:'Manage Analytics'
                }
            ],
            admin:[
                {
                    permissionId:2,
                    permissionName:'Manage Brand'
                },
                {
                    permissionId:3,
                    permissionName:'Manage Analytics'
                }
            ]
        },
        brand:{
            admin:[
                {
                    permissionId:1,
                    permissionName:'Manage Customers'
                },
                {
                    permissionId:2,
                    permissionName:'Send Outlet Instructions'
                },
                {
                    permissionId:3,
                    permissionName:'View Analytics'
                },
                {
                    permissionId:4,
                    permissionName:'Manage Outlets'
                },
                {
                    permissionId:5,
                    permissionName:'Manage Dishes'
                },
                {
                    permissionId:6,
                    permissionName:'View Orders'
                }
            ],
            manager:[
                {
                    permissionId:1,
                    permissionName:'Manage Customers'
                },
                {
                    permissionId:3,
                    permissionName:'View Analytics'
                },
                {
                    permissionId:4,
                    permissionName:'Manage Outlets'
                },
                {
                    permissionId:5,
                    permissionName:'Manage Dishes'
                }
            ],
            chef:[
                {
                    permissionId:5,
                    permissionName:'Manage Dishes'
                }
            ]
        },
        outlet:{
            admin:[
                {
                    permissionId:1,
                    permissionName:'Manage Orders'
                },
                {
                    permissionId:2,
                    permissionName:'Allow Take Away Orders'
                },
                {
                    permissionId:3,
                    permissionName:'View Analytics'
                },
                {
                    permissionId:4,
                    permissionName:'Create Orders'
                }
            ],
            seller:[
                {
                    permissionId:1,
                    permissionName:'Manage Orders'
                },
                {
                    permissionId:4,
                    permissionName:'Create Orders'
                }
            ],
            manager:[
                {
                    permissionId:1,
                    permissionName:'Manage Orders'
                },
                {
                    permissionId:2,
                    permissionName:'Allow Take Away Orders'
                },
                {
                    permissionId:3,
                    permissionName:'View Analytics'
                }
            ]
        }
    };
    return {
        isAuthorized : function (currentPermissions,requiredPermissionId,allowedRoles,currentRole,a) {
            var isPermissionAuthorized = currentPermissions.find(function (permission) {
                return permission.permissionId === requiredPermissionId;
            });
            var isRoleAuthorized = allowedRoles.find(function (role) {
                return role === currentRole;
            })
            if(a){
                console.log(currentPermissions,requiredPermissionId,allowedRoles,currentRole);
            }
            return isPermissionAuthorized && isRoleAuthorized;
        },
        getPermissions : function (role,subRoles) {
            var netPermissions = {};
            subRoles.forEach(function (subRole) {
                permissions[role][subRole].forEach(function (permission) {
                    netPermissions[permission.permissionId] = permission;
                })
            })
            return Object.values(netPermissions);
        },
        getRoles:function (role) {
            console.log(Object.keys((permissions[role] || {})));
            return Object.keys((permissions[role] || {}));
        }
    }
})