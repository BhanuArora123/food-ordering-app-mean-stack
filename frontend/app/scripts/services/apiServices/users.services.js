

// user service
appModule
    .factory("userService", function ($http,$state) {
        return {
            userData: {},
            signup: function (name,email, password) {
                return $http
                    .post("http://localhost:8080/user/register", {
                        email: email,
                        password: password,
                        name: name
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
            },
            login: function (email, password) {
                return $http
                    .post("http://localhost:8080/user/login", {
                        email: email,
                        password: password
                    })
                    .then(function (response) {
                        alert(response.data.message);
                        $state.go("home.dashboard");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        $state.go("home.login");
                    })
            },
            getUserData:function () {
                return $http
                    .get("http://localhost:8080/user/userData")
                    .then(function (response) {
                        this.userData = response.data;
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            }
        }
    })