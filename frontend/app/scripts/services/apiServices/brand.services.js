'use-strict';

// user service
appModule
    .factory("brandService", function ($http, $state) {
        return {
            signup: function (name, email, password) {
                return $http
                    .post("http://localhost:8080/brand/register", {
                        email: email,
                        password: password,
                        name: name
                    })
                    .then(function (response) {
                        alert(response.data.message);
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            },
            login: function (email, password) {
                return $http
                    .post("http://localhost:8080/brand/login", {
                        email: email,
                        password: password
                    })
                    .then(function (response) {
                        localStorage.setItem("brandData", JSON.stringify(response.data.brandData));
                        localStorage.setItem("role", "brand");
                        alert(response.data.message);
                        $state.go("home.dashboard");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            },
            getBrandData: function () {
                return $http
                    .get("http://localhost:8080/brand/brandData")
                    .then(function (response) {
                        localStorage.setItem("brandData", JSON.stringify(response.data.brandData));
                        localStorage.setItem("role", "brand");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            },
            getServiceData: function () {
                return {
                    brandData: JSON.parse(localStorage.getItem("brandData")),
                    role: localStorage.getItem("role")
                }
            }
        }
    })