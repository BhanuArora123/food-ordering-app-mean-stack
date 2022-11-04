

// user service
appModule
    .factory("userService", function ($http,$state) {
        return {
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
                        localStorage.setItem("userData",response.data.userData);
                        localStorage.setItem("role","user");
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
                        localStorage.setItem("userData",JSON.stringify(response.data.userData));
                        localStorage.setItem("role","user");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            },
            addToCart:function (foodName,foodPrice,outletName) {
                return $http.put("http://localhost:8080/user/addToCart",{
                    foodItemName:foodName,
                    foodItemPrice:foodPrice,
                    outletName:outletName
                })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
            },
            getServiceData:function () {
                return {
                    userData:localStorage.getItem("userData"),
                    role:localStorage.getItem("role")
                };
            }
        }
    })