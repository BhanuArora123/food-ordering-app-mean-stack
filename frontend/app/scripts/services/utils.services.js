

appModule
    .factory("utility", function () {
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
            }
        }
    })