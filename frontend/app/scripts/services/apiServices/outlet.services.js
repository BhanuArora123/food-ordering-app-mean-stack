

// user service
appModule
    .service("outletService", function ($http,blockUI,userService,$rootScope) {
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
        this.getOutletUsers = function (page, limit,outletId,subRole,brandId,query) {
            return $http
                .get("http://localhost:8080/outlet/users/get",{
                    params:{
                        outletId:outletId,
                        page:page,
                        limit:limit,
                        search:query,
                        subRole:subRole,
                        brandId:brandId
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
                        outletId:userData.outlets[$rootScope.currentOutletIndex].id
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
                    outletId:userService.userData().outlets[$rootScope.currentOutletIndex].id
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
        this.editOutlet = function (outlet) {
            blockUI.start({
                message: "Editing Outlet..."
            })
            return $http
                .put("http://localhost:8080/outlet/edit",
                    {
                        outletId: outlet._id,
                        name: outlet.name,
                        brandId:outlet.brand.id,
                        isDisabled:outlet.isDeleted
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
        this.deleteOutlet = function (outletId,brandId) {
            blockUI.start({
                message: "Deleting Outlet..."
            })
            return $http
                .delete("http://localhost:8080/outlet/delete",
                    {
                        params:{
                            outletId:outletId,
                            brandId:brandId
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
    })