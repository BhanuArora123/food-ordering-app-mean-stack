'use-strict';

// user service
appModule
    .factory("outletService", function ($http, $state) {
        return {
            signup: function (name, email, password) {
                return $http
                    .post("http://localhost:8080/outlet/register", {
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
                    .post("http://localhost:8080/outlet/login", {
                        email: email,
                        password: password
                    })
                    .then(function (response) {
                        localStorage.setItem("outletData", JSON.stringify(response.data.outletData));
                        localStorage.setItem("role", "outlet");
                        alert(response.data.message);
                        $state.go("home.dashboard");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            },
            getOutletData: function () {
                return $http
                    .get("http://localhost:8080/outlet/outletData")
                    .then(function (response) {
                        localStorage.setItem("outletData", JSON.stringify(response.data.outletData));
                        localStorage.setItem("role", "outlet");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            },
            getServiceData: function () {
                return {
                    outletData: JSON.parse(localStorage.getItem("outletData")),
                    role: localStorage.getItem("role")
                }
            }
        }
    })