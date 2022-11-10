

appModule
.factory("orderService",function ($http) {
    return {
        placeOrder:function () {
            return $http.post("http://localhost:8080/orders/placeOrder",{})
            .then(function (res) {
                return res.data;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        getAllOrders: function (data) {
            var status = data.status;
            var outletName = data.outletName;
            var queryParam = {
                page:1,
                limit:9
            };
            if (status) {
                queryParam["status"] = status;
            }
            if(outletName){
                queryParam["outletName"] = outletName;
            }
            return $http
                .get("http://localhost:8080/orders/getAllOrders", {
                    params: queryParam
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