

appModule
    .factory("utility", function ($uibModal,$state) {
        return {
            categorizeItems : function (data) {
                // categorize by sub category 
                var subCategorizedItems = {};

                data.forEach(function (items) {
                    console.log(items.subCategory);
                    if(!subCategorizedItems[items.subCategory]){
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
                        if(!categorizedItems[category]){
                            categorizedItems[category] = [];
                        }
                        var subCategoryItems = {};

                        categorizedItems[category].push({
                            subCategory:items,
                            items:subCategorizedItems[items]
                        });
                    }
                }
                
                var categorizedItemsArray = [];

                for (var items in categorizedItems) {
                    if (Object.hasOwnProperty.call(categorizedItems, items)) {
                        var subCategoryItems = categorizedItems[items];
                        categorizedItemsArray.push({
                            category:items,
                            subCategoryItems:subCategoryItems
                        });
                    }
                }

                return categorizedItemsArray;
            },
            getRole : function () {
                return localStorage.getItem("role");
            },
            decategorizeItems:function (categorizedItems) {
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
            openModal: function (templateUrl,controller,instanceName,scope,extraData,currentScope) {
                // console.log("hello");
                if(scope){
                    scope.extraData = extraData;
                }
                var modalInstance = $uibModal.open({
                    backdrop:true,
                    controller:controller,
                    scope:scope?scope:currentScope,
                    templateUrl:templateUrl,
                    windowClass: 'show bg-transparent',
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    backdropClass:"opacity-medium"
                })
                currentScope[instanceName] = modalInstance;
            },
            logout: function () {
                localStorage.clear();
                $state.go("home.login");
            }
        }
    })