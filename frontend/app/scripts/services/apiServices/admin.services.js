

// user service
appModule
    .factory("adminService", function ($http) {
        return {
            adminData: {},
            signup: function (email, password, name, role) {
                return $http
                    .post("http://localhost:8080/admin/register", {
                        email: email,
                        password: password,
                        name: name,
                        role:role
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
                    .post("http://localhost:8080/admin/login", {
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