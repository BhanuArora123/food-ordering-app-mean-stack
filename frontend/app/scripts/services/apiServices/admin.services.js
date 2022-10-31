

// user service
appModule
    .factory("adminService", function ($http, $state) {
        return {
            signup: function (email, password, name, role) {
                return $http
                    .post("http://localhost:8080/admin/register", {
                        email: email,
                        password: password,
                        name: name,
                        role: role
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
                    .then((response) => {
                        localStorage.setItem("adminData",response.data.adminData);
                        localStorage.setItem("role",response.data.adminData.role);
                        $state.go("home.dashboard");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            },
            getAdminData: function () {
                return $http
                    .get("http://localhost:8080/adminData")
                    .then(function (response) {
                        localStorage.setItem("adminData",response.data.adminData);
                        localStorage.setItem("role",response.data.adminData.role);
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            },
            getServiceData: function () {
                return {
                    adminData:localStorage.getItem("adminData"),
                    role:localStorage.getItem("role")
                }
            }
        }
    })