

// user service
appModule
    .service("outletService", function ($http, $state,blockUI,userService) {
        this.getOutletData = function () {
            return $http
                .get("http://localhost:8080/outlet/outletData")
                .then(function (response) {
                    localStorage.setItem("outletData", JSON.stringify(response.data.outletData));
                    localStorage.setItem("role", "outlet");
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                    alert(error.message);
                })
        }
        this.getAllOutlets = function (page, limit,brandId,query) {
            return $http
                .get("http://localhost:8080/outlet/getAll",{
                    params:{
                        brandId:brandId,
                        page:page,
                        limit:limit,
                        search:query
                    }
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        this.getOutletUsers = function (page, limit,outletId,query) {
            return $http
                .get("http://localhost:8080/outlet/users/get",{
                    params:{
                        outletId:outletId,
                        page:page,
                        limit:limit,
                        search:query
                    }
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        this.getCart = function () {
            var cart = localStorage.getItem("cart");
            if(cart){
                return JSON.parse(cart);
            }
            else{
                return new Map();
            }
        }
        this.addToCart = function (foodItemId,cartData) {
            // foodName, foodPrice, outletName, category, subCategory,taxes
            var cartMap = this.getCart();
            if(cartMap[foodItemId]){
                cartMap[foodItemId].quantity += 1;
            }
            else{
                cartData["quantity"] = 1;
                cartData["foodItemId"] = foodItemId;
                cartMap[foodItemId] = cartData;
            }
            localStorage.setItem("cart",JSON.stringify(cartMap));
            return cartMap;
        }
        this.removeFromCart = function (foodItemId) {
            var cartMap = this.getCart();
            if(!cartMap[foodItemId]){
                console.log("no cart exist!");
            }
            cartMap[foodItemId].quantity -= 1;
            if(!cartMap[foodItemId].quantity){
                cartMap[foodItemId] = undefined;
            }
            localStorage.setItem("cart",JSON.stringify(cartMap));
            return cartMap;
        }
        this.getTables = function (page, limit, isAssigned) {
            var userData = userService.userData();
            return $http
                .get("http://localhost:8080/outlet/table/get", {
                    params: {
                        page: page,
                        limit: limit,
                        isAssigned: isAssigned,
                        outletId:userData.outlets[0].id
                    }
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        this.addTable = function (table) {
            blockUI.start({
                message:"Creating Table"
            })
            return $http
                .post("http://localhost:8080/outlet/table/add", {
                    tableId: table.tableId,
                    outletId:userService.userData().outlets[0].id
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
        this.getPermissions = function () {
            return $http
            .get("http://localhost:8080/outlet/permissions/get")
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            })
        };
        this.editPermissions = function (data) {
            blockUI.start({
                message:"Editing User Permissions..."
            })
            return $http
            .put("http://localhost:8080/outlet/permissions/edit",{
                outletId:data.outletId,
                permissions:(data.permissions?data.permissions:[])
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
        this.getServiceData = function () {
            return {
                outletData: JSON.parse(localStorage.getItem("outletData")),
                role: localStorage.getItem("role")
            };
        }
    })