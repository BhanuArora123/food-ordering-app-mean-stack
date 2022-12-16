

// user service
appModule
    .service("outletService", function ($http, $state,blockUI,brandService) {
        this.signup = function (name, email,permissions) {
            var brandData = brandService.getServiceData().brandData;
            return $http
                .post("http://localhost:8080/outlet/register", {
                    email: email,
                    name: name,
                    brand: {
                        id: brandData._id,
                        name: brandData.name
                    },
                    permissions:permissions
                })
                .then(function (response) {
                    alert(response.data.message);
                    $state.go("home.dashboard");
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                    $state.go("home.signup");
                    alert(error.message);
                })
        };
        this.login = function (email, password) {
            blockUI.start({
                message:"Login In Progress..."
            })
            return $http
                .post("http://localhost:8080/outlet/login", {
                    email: email,
                    password: password
                })
                .then(function (response) {
                    blockUI.stop();
                    localStorage.setItem("outletData", JSON.stringify(response.data.outletData));
                    localStorage.setItem("role", "outlet");
                    $state.go("home.dashboard");
                    return response.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                    $state.go("home.login");
                })
        }
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
        this.updatePassword = function (currentPassword, newPassword) {
            return $http
                .put("http://localhost:8080/outlet/updatePassword", {
                    currentPassword: currentPassword,
                    newPassword: newPassword
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
            return $http
                .get("http://localhost:8080/outlet/table/get", {
                    params: {
                        page: page,
                        limit: limit,
                        isAssigned: isAssigned
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
            return $http
                .post("http://localhost:8080/outlet/table/add", {
                    tableId: table.tableId
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
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