

appModule
    .service("foodService", function ($http, blockUI) {
        this.getFoodItems = function (data) {
            blockUI.start({
                message: "Loading..."
            })
            return $http({
                url: "http://localhost:8080/food/getFoodItems",
                method: "GET",
                params: {
                    brandId: data.brandId,
                    minPrice: data.minPrice,
                    maxPrice: data.maxPrice,
                    minRating: data.minRating,
                    isVeg: data.isVeg,
                    foodName: data.foodName
                }
            })
                .then(function (response) {
                    blockUI.stop();
                    return response.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                })
        };
        this.addFoodItem = function (data) {
            blockUI.start({
                message: "Adding Food Item..."
            })
            var taxes = data.taxes.map(function (tax) {
                return {
                    tax:{
                        name:tax.name,
                        percentageRange:tax.percentageRange
                    },
                    percentage:tax.percentage
                };
            });
            var foodData = new FormData();
            var isVeg = (data.isVeg === undefined) ? false : true;
            data.isVeg = isVeg;
            foodData.append("foodName", data.name);
            foodData.append("foodPrice", data.price);
            foodData.append("foodDesc", data.desc);
            foodData.append("isVeg", isVeg);
            foodData.append("foodImage", data.foodImage);
            foodData.append("subCategory", data.subCategory);
            foodData.append("category", data.category);
            foodData.append("brand", JSON.stringify(data.brand));
            foodData.append("taxes",JSON.stringify(taxes));
            return $http({
                url: "http://localhost:8080/food/addFoodItem",
                method: "POST",
                data: foodData,
                transformRequest: function (data) {
                    return data;
                },
                headers: {
                    "Content-Type": undefined
                }
            })
                .then(function (response) {
                    blockUI.stop();
                    return response.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                })
        };
        this.editFoodItem = function (data) {
            return $http
                .put("http://localhost:8080/food/editFoodItem", data)
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.deleteFoodItem = function (foodItemId) {
            blockUI.start({
                message: "Delete In Progress..."
            })
            return $http
                .delete("http://localhost:8080/food/removeFoodItem", {
                    params: {
                        foodItemId: foodItemId
                    }
                })
                .then(function (res) {
                    blockUI.stop();
                    return res.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                })
        };
        this.getCategories = function () {
            return $http
                .get("http://localhost:8080/category/get")
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.createCategory = function (category) {
            return $http.post("http://localhost:8080/category/create", {
                category: category
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.createSubCategory = function (subCategory, category) {
            return $http.post("http://localhost:8080/category/sub/create", {
                subCategoryName: subCategory,
                category: category
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.getSubCategories = function (category) {
            return $http
                .get("http://localhost:8080/category/sub/get", {
                    params: {
                        category: category
                    }
                })
                .then(function (res) {
                    return res.data.subCategories.map(function (subCategory) {
                        return subCategory.name;
                    });
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    })