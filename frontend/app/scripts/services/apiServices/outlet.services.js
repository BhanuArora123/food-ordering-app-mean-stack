

// user service
appModule
    .service("outletService", function ($http, $state,blockUI) {
        this.signup = function (name, email, password, brandData) {
            return $http
                .post("http://localhost:8080/outlet/register", {
                    email: email,
                    password: password,
                    name: name,
                    brand: {
                        id: brandData._id,
                        name: brandData.name
                    }
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
        this.addToCart = function (foodName, foodPrice, outletName, category, subCategory) {
            return $http.put("http://localhost:8080/outlet/addToCart", {
                foodItemName: foodName,
                foodItemPrice: foodPrice,
                outletName: outletName,
                subCategory: subCategory,
                category: category
            })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        this.removeFromCart = function (foodItemName) {
            return $http
                .put("http://localhost:8080/outlet/removeFromCart", {
                    foodItemName: foodItemName
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
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
        }
        this.getServiceData = function () {
            return {
                outletData: JSON.parse(localStorage.getItem("outletData")),
                role: localStorage.getItem("role")
            };
        }
    })