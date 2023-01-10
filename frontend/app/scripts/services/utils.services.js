

appModule
    .factory("utility", function ($uibModal, $state, permission, userService, $rootScope) {
        return {
            categorizeItems: function (data) {
                // categorize by sub category 
                var categorizedItems = {};

                data.forEach(function (items) {
                    console.log(items.category.name);
                    if (!categorizedItems[items.category.id]) {
                        categorizedItems[items.category.id] = {
                            name: items.category.name,
                            items: []
                        };
                    }
                    categorizedItems[items.category.id].items.push(items);
                })

                // var categorizedItemsArray = [];
                console.log(categorizedItems);

                for (var categoryId in categorizedItems) {
                    var categoryItems = categorizedItems[categoryId];
                    var categorizedItemsArray = categoryItems.items;
                    console.log(categorizedItemsArray);
                    var subCategorizedItems = {};
                    categorizedItemsArray.forEach(function (categoryItem) {
                        if (!subCategorizedItems[categoryItem.category.subCategory.id]) {
                            subCategorizedItems[categoryItem.category.subCategory.id] = {
                                name: categoryItem.category.subCategory.name,
                                subCategoryItems: []
                            };
                        }
                        subCategorizedItems[categoryItem.category.subCategory.id].subCategoryItems.push(categoryItem);
                    })
                    categorizedItems[categoryId].subCategories = subCategorizedItems;
                }
                return categorizedItems;
            },
            getRole: function () {
                var userData = userService.userData();
                var userRole = userData ? userData.role.name: localStorage.getItem("role");
                console.log("role - ",userRole);
                return userRole;
            },
            decategorizeItems: function (categorizedItems) {
                var items = [];

                categorizedItems.forEach(function (categoryItems) {
                    categoryItems.subCategoryItems.forEach(function (subCategoryItems) {
                        subCategoryItems.items.forEach(function (foodItem) {
                            items.push(foodItem);
                        })
                    })
                })

                return items;
            },
            // open modal for cart 
            openModal: function (templateUrl, controller, instanceName, scope, extraData, currentScope) {
                // console.log("hello");
                if (scope) {
                    scope.extraData = extraData;
                }
                var modalInstance = $uibModal.open({
                    backdrop: true,
                    controller: controller,
                    scope: scope ? scope : currentScope,
                    templateUrl: templateUrl,
                    windowClass: 'show bg-transparent',
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    backdropClass: "opacity-medium"
                })
                currentScope[instanceName] = modalInstance;
            },
            logout: function () {
                localStorage.clear();
                permission.unsetAllAuthorizations();
                $state.go("home.login");
            },
            calculateAmount: function (items,discount = 0) {
                var taxesMap = new Map();
                var totalFoodAmount = 0;
                var totalTaxAmount = 0;
                items.forEach(function (item) {
                    totalFoodAmount += (item.foodPrice * item.quantity);
                    item.taxes.forEach(function (tax) {
                        var taxLevied = item.foodPrice * 0.01 * tax.percentage * item.quantity;
                        console.log(taxLevied);
                        totalTaxAmount += taxLevied;
                        taxesMap[tax.tax.name] = (taxesMap[tax.tax.name] ? taxesMap[tax.tax.name] : 0) + (taxLevied);
                    })
                })
                var totalOfferDiscount = (totalFoodAmount*0.01*discount);
                console.log({
                    totalPayable: totalFoodAmount + totalTaxAmount,
                    taxesMap: taxesMap,
                    totalFoodAmount: totalFoodAmount,
                    totalTaxAmount: totalTaxAmount,
                    totalOfferDiscount:totalOfferDiscount
                });
                return {
                    totalPayable: totalFoodAmount + totalTaxAmount - totalOfferDiscount,
                    taxesMap: taxesMap,
                    totalFoodAmount: totalFoodAmount,
                    totalTaxAmount: totalTaxAmount,
                    totalOfferDiscount:totalOfferDiscount
                }
            },
            debounce: function (delay, cb) {
                var timeout;
                return function () {
                    var argumentsList = arguments;
                    clearTimeout(timeout);
                    setTimeout(function () {
                        cb(argumentsList);
                    }, delay);
                }
            },
            getCurrentTimezone: function () {
                return Intl.DateTimeFormat().resolvedOptions().timeZone;
            },
            setPermissionAuthorization: function () {
                var userData = userService.userData();
                if (!userData) {
                    return;
                }
                var permissions = userData.permissions;
                var role = userData.role.name;
                permission.setPermissionAuthorization("manageDishes", permission.isAuthorized(permissions, 5, ['brand', 'outlet'], role))
                permission.setPermissionAuthorization("manageDishesOutlets", permission.isAuthorized(permissions, 5, ['outlet'], role))
                permission.setPermissionAuthorization("manageDishesBrand", permission.isAuthorized(permissions, 5, ['brand'], role))
                permission.setPermissionAuthorization("manageAdmins", permission.isAuthorized(permissions, 1, ['superAdmin', 'admin'], role))
                permission.setPermissionAuthorization("manageBrands", permission.isAuthorized(permissions, 2, ['superAdmin', 'admin'], role))
                permission.setPermissionAuthorization("manageBrandUsers", permission.isAuthorized(permissions, 7, ['brand'], role))
                permission.setPermissionAuthorization("manageOutlets", permission.isAuthorized(permissions, 7, ['brand'], role))
                permission.setPermissionAuthorization("manageOutletUsers", permission.isAuthorized(permissions, 6, ['outlet'], role))
                permission.setPermissionAuthorization("manageAnalytics", permission.isAuthorized(permissions, 3, ['superAdmin', 'admin', 'brand', 'outlet'], role))
                permission.setPermissionAuthorization("manageOrdersBrand", permission.isAuthorized(permissions, 6, ['brand'], role))
                permission.setPermissionAuthorization("manageOrdersOutlet", permission.isAuthorized(permissions, 1, ['outlet'], role))
                permission.setPermissionAuthorization("manageCustomers", permission.isAuthorized(permissions, 1, ['brand'], role))
                permission.setPermissionAuthorization("userRole", userData.role.name)
                console.log(permission.getPermissionAuthorizations());
            },
            
        }
    })