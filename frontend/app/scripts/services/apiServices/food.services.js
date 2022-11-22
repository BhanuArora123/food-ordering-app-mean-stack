

appModule.factory("foodService", function ($http) {
    return {
        getFoodItems: function (data) {
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
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        addFoodItem: function (data) {
            var foodData = new FormData();
            var isVeg = (data.isVeg === undefined) ? false : true;
            data.isVeg = isVeg;
            foodData.append("foodName",data.name);
            foodData.append("foodPrice",data.price);
            foodData.append("description",data.desc);
            foodData.append("outletName",data.outletName);
            foodData.append("isVeg",isVeg);
            foodData.append("foodImage",data.foodImage);
            foodData.append("subCategory",data.subCategory);
            foodData.append("category",data.category);
            foodData.append("brand",JSON.stringify(data.brand));
            return $http({
                url: "http://localhost:8080/food/addFoodItem",
                method: "POST",
                data: foodData,
                transformRequest: function(data) {
                    return data; 
                },
                headers:{
                    "Content-Type":undefined
                }            
            })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        editFoodItem: function (data) {
            return $http
                .put("http://localhost:8080/food/editFoodItem", data)
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        deleteFoodItem: function (foodItemId) {
            console.log("item del");
            return $http
                .delete("http://localhost:8080/food/removeFoodItem",{
                    params:{
                        foodItemId:foodItemId
                    }
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        getCategories: function () {
            return $http
                .get("http://localhost:8080/category/get")
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        createCategory: function (category) {
            return $http.post("http://localhost:8080/category/create", {
                category: category
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        createSubCategory: function (subCategory, category) {
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
        },
        getSubCategories: function (category) {
            return $http
                .get("http://localhost:8080/category/sub/get", {
                    params: {
                        category: category
                    }
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    }
})