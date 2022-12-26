

appModule.service("userService", function ($http, blockUI, $state) {
    var userDetails;
    this.signup = function (registerationData) {
        blockUI.start({
            message: "Signup In Progress...."
        })
        return $http
            .post("http://localhost:8080/user/register", {
                email: registerationData.email,
                name: registerationData.name,
                permissions: registerationData.permissions,
                outlet: registerationData.outlet,
                brand: registerationData.brand,
                role: registerationData.role,
                password: registerationData.password
            })
            .then(function (response) {
                blockUI.stop();
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
                blockUI.stop();
            })
    };
    this.login = function (loginData) {
        blockUI.start({
            message: "Login In Progress...."
        })
        return $http
            .post("http://localhost:8080/user/login", {
                email: loginData.email,
                password: loginData.password
            })
            .then(function (response) {
                blockUI.stop();
                localStorage.setItem("userData", JSON.stringify(response.data.userData));
                // localStorage.setItem("role", response.data.userData.role);
                userDetails = response.data.userData;
                $state.go("home.dashboard");
                return response.data;
            })
            .catch(function (error) {
                blockUI.stop();
                console.log(error);
            })
    };
    this.getUserData = function () {
        var userId = JSON.parse(localStorage.getItem("userData"))._id;
        return $http
            .get("http://localhost:8080/user/profile",{
                params:{
                    userId:userId
                }
            })
            .then(function (response) {
                localStorage.setItem("userData", JSON.stringify(response.data.userData));
                // localStorage.setItem("role", response.data.userData.role);
                userDetails = response.data.userData;
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            })
    };
    this.updatePassword = function (currentPassword, newPassword) {
        blockUI.start({
            message: "Updating Password...."
        })
        return $http
            .put("http://localhost:8080/user/updatePassword", {
                currentPassword: currentPassword,
                newPassword: newPassword,
                userId:userDetails._id
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
    this.adminCount = function () {
        return $http.get("http://localhost:8080/user/admin/count")
        .then(function (res) {
            return res.data;
        })
        .catch(function (error) {
            console.log(error);
        })
    };
    this.getAllAdmins = function (page,limit) {
        return $http
        .get("http://localhost:8080/user/admin/all",
        {
            params:{
                page:page,
                limit:limit
            }
        })
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        })
    };
    this.userData = function () {
        return userDetails;
    }
})