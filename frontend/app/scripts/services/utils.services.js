

appModule
    .factory("utility", function ($uibModal, $state) {
        return {
            categorizeItems: function (data) {
                // categorize by sub category 
                var subCategorizedItems = {};

                data.forEach(function (items) {
                    console.log(items.subCategory);
                    if (!subCategorizedItems[items.subCategory]) {
                        subCategorizedItems[items.subCategory] = [];
                    }
                    subCategorizedItems[items.subCategory].push(items);
                })

                // category 
                var categorizedItems = {};

                for (var items in subCategorizedItems) {
                    if (Object.hasOwnProperty.call(subCategorizedItems, items)) {
                        var itemSubCategorized = subCategorizedItems[items];
                        var category = itemSubCategorized[0].category;
                        if (!categorizedItems[category]) {
                            categorizedItems[category] = [];
                        }
                        var subCategoryItems = {};

                        categorizedItems[category].push({
                            subCategory: items,
                            items: subCategorizedItems[items]
                        });
                    }
                }

                var categorizedItemsArray = [];

                for (var items in categorizedItems) {
                    if (Object.hasOwnProperty.call(categorizedItems, items)) {
                        var subCategoryItems = categorizedItems[items];
                        categorizedItemsArray.push({
                            category: items,
                            subCategoryItems: subCategoryItems
                        });
                    }
                }

                return categorizedItemsArray;
            },
            getRole: function () {
                return localStorage.getItem("role");
            },
            getPermissions : function (role) {
                if(role === 'Admin'){
                    return [
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
                    ];
                }
                else if(role === 'Brand'){
                    return [
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
                        }
                    ]
                }
                else{
                    return [
                        {
                            permissionId:1,
                            permissionName:'Manage Food Items'
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
                $state.go("home.login");
            },
            calculateAmount: function (items) {
                var taxesMap = new Map();
                var totalFoodAmount = 0;
                var totalTaxAmount = 0;
                items.forEach(function (item) {
                    totalFoodAmount += (item.foodPrice*item.quantity);
                    item.taxes.forEach(function (tax) {
                        var taxLevied = item.foodPrice * 0.01 * tax.percentage * item.quantity;
                        console.log(taxLevied);
                        totalTaxAmount += taxLevied;
                        taxesMap[tax.tax.name] = (taxesMap[tax.tax.name] ? taxesMap[tax.tax.name] : 0) + (taxLevied);
                    })
                })
                console.log({
                    totalPayable: totalFoodAmount + totalTaxAmount,
                    taxesMap: taxesMap,
                    totalFoodAmount: totalFoodAmount,
                    totalTaxAmount: totalTaxAmount
                });
                return {
                    totalPayable: totalFoodAmount + totalTaxAmount,
                    taxesMap: taxesMap,
                    totalFoodAmount: totalFoodAmount,
                    totalTaxAmount: totalTaxAmount
                }
            },
            debounce: function (delay,cb) {
                var timeout;
                return function () {
                    var argumentsList = arguments;
                    clearTimeout(timeout);
                    setTimeout(function () {
                        cb(argumentsList);
                    },delay);
                }
            }
        }
    })