

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
            foodData.append("name",data.name);
            foodData.append("price",data.price);
            foodData.append("description",data.desc);
            foodData.append("outletId",data.outletId);
            foodData.append("isVeg",data.isVeg);
            foodData.append("foodImage",data.foodImage);
            return $http({
                url:"http://localhost:8080/food/addFoodItem",
                method:"POST",
                data:foodData,
                headers:{
                    "Content-Type":undefined
                },
                transformRequest: function(data, headersGetterFunction) {
                    return data; // do nothing! FormData is very good!
                }            
            })
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            })
        }
    }
})