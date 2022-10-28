

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
        }
    }
})