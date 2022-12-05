'use-strict';

// user service
appModule
    .service("brandService", function ($http, $state, blockUI) {
        this.signup = function (name, email, password) {
            blockUI.start({
                message: "Signup in Progress..."
            })
            return $http
                .post("http://localhost:8080/brand/register", {
                    email: email,
                    password: password,
                    name: name
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
        this.login = function (email, password) {
            blockUI.start({
                message: "Login in Progress..."
            })
            return $http
                .post("http://localhost:8080/brand/login", {
                    email: email,
                    password: password
                })
                .then(function (response) {
                    blockUI.stop();
                    localStorage.setItem("brandData", JSON.stringify(response.data.brandData));
                    localStorage.setItem("role", "brand");
                    alert(response.data.message);
                    $state.go("home.dashboard");
                    return response.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                    alert(error.message);
                })
        };
        this.updatePassword = function (currentPassword, newPassword) {
            blockUI.start({
                message: "Updating Password..."
            })
            return $http
                .put("http://localhost:8080/brand/updatePassword", {
                    currentPassword: currentPassword,
                    newPassword: newPassword
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
        this.getBrandData = function () {
            return $http
            .get("http://localhost:8080/brand/brandData")
                .then(function (response) {
                    localStorage.setItem("brandData", JSON.stringify(response.data.brandData));
                    localStorage.setItem("role", "brand");
                    console.log(response.headers);
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
            };
            this.getAllOutlets = function (page, limit) {
                return $http
                .get("http://localhost:8080/brand/outlet/getAll")
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
            };
            this.editOutlet = function (outlet) {
                blockUI.start({
                    message: "Editing Outlet..."
                })
                return $http
                .put("http://localhost:8080/brand/outlet/edit",
                {
                    outletId: outlet._id,
                    name: outlet.name,
                    email: outlet.email
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
        this.getServiceData = function () {
            return {
                brandData: JSON.parse(localStorage.getItem("brandData")),
                role: localStorage.getItem("role")
            }
        };
    })