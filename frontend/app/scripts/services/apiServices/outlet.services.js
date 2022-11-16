

// user service
appModule
    .factory("outletService", function ($http,$state) {
        return {
            signup: function (name,email, password,brandData) {
                return $http
                    .post("http://localhost:8080/outlet/register", {
                        email: email,
                        password: password,
                        name: name,
                        brand:{
                            id: brandData._id,
                            name:brandData.name
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
            },
            login: function (email, password) {
                return $http
                    .post("http://localhost:8080/outlet/login", {
                        email: email,
                        password: password
                    })
                    .then(function (response) {
                        alert(response.data.message);
                        localStorage.setItem("outletData",JSON.stringify(response.data.outletData));
                        localStorage.setItem("role","outlet");
                        $state.go("home.dashboard");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        $state.go("home.login");
                    })
            },
            getOutletData:function () {
                return $http
                    .get("http://localhost:8080/outlet/outletData")
                    .then(function (response) {
                        localStorage.setItem("outletData",JSON.stringify(response.data.outletData));
                        localStorage.setItem("role","outlet");
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert(error.message);
                    })
            },
            addToCart:function (foodName,foodPrice,outletName,category,subCategory) {
                return $http.put("http://localhost:8080/outlet/addToCart",{
                    foodItemName:foodName,
                    foodItemPrice:foodPrice,
                    outletName:outletName,
                    subCategory:subCategory,
                    category:category
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
                    outletData:JSON.parse(localStorage.getItem("outletData")),
                    role:localStorage.getItem("role")
                };
            }
        }
    })