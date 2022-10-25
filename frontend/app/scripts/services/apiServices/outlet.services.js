'use-strict';

// user service
appModule
    .factory("outletService", function ($http) {
        return {
            userData: {},
            signup: function (email, password, name) {
                return $http
                    .post("http://localhost:8080/outlet/register", {
                        email: email,
                        password: password,
                        name: name
                    })
                    .then(function (response) {
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
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            }
        }
    })