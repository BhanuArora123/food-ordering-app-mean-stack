

appModule.factory("foodService",function ($http) {
    return {
        getFoodItems : function (data) {
            return $http({
                url:"http://localhost:8080/food/getFoodItems",
                method:"GET",
                params : {
                    outletId:data.outletId,
                    minPrice:data.minPrice,
                    maxPrice:data.maxPrice,
                    minRating:data.minRating,
                    isVeg:data.isVeg,
                    foodName:data.foodName
                }
            })
            .then(function (response) {
                return response.data;
            })
        },
        addFoodItem : function (data) {
            var foodData = new FormData();
            var isVeg = (data.isVeg === undefined)?false:true; 
            data.isVeg = isVeg;
            // foodData.append("foodName",data.name);
            // foodData.append("foodPrice",data.price);
            // foodData.append("description",data.desc);
            // foodData.append("outletName",data.outletName);
            // foodData.append("isVeg",isVeg);
            // foodData.append("foodImage",data.foodImage);
            // foodData.append("subCategory",data.subCategory);
            // foodData.append("category",data.category);
            return $http({
                url:"http://localhost:8080/food/addFoodItem",
                method:"POST",
                data:{
                    foodName:data.name,
                    foodPrice:data.price,
                    description:data.desc,
                    outletName:data.outletName,
                    isVeg:isVeg,
                    subCategory:data.subCategory,
                    category:data.category,
                    brand:data.brand
                },
                // transformRequest: function(data) {
                //     return data; 
                // }            
            })
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        getCategories:function () {
            return $http
            .get("http://localhost:8080/category/get")
            .then(function (res) {
                return res.data;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        createCategory:function (category) {
            return $http.post("http://localhost:8080/category/create",{
                category:category
            })
            .then(function (res) {
                return res.data;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        createSubCategory:function (subCategory,category) {
            return $http.post("http://localhost:8080/category/sub/create",{
                subCategoryName:subCategory,
                category:category
            })
            .then(function (res) {
                return res.data;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        getSubCategories : function (category) {
            return $http
            .get("http://localhost:8080/category/sub/get",{
                params:{
                    category:category
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