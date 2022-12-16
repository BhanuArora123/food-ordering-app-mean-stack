// https://www.youtube.com/watch?v=UH7wkvcf0ys
//https://www.youtube.com/watch?v=8aGhZQkoFbQ

// user service
appModule
    .service("adminService", function ($http, $state,blockUI) {
            this.signup = function ( name,email, role,permissions) {
                blockUI.start({
                    message:"Signup In Progress...."
                })
                return $http
                    .post("http://localhost:8080/admin/register", {
                        email: email,
                        name: name,
                        role: role,
                        permissions:permissions
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
            this.login = function (email, password) {
                blockUI.start({
                    message:"Login In Progress...."
                })
                return $http
                    .post("http://localhost:8080/admin/login", {
                        email: email,
                        password: password
                    })
                    .then((response) => {
                        blockUI.stop();
                        localStorage.setItem("adminData", JSON.stringify(response.data.adminData));
                        localStorage.setItem("role", response.data.adminData.role);
                        $state.go("home.dashboard");
                        return response.data;
                    })
                    .catch(function (error) {
                        blockUI.stop();
                        console.log(error);
                    })
            };
            this.getAdminData = function () {
                
                return $http
                .get("http://localhost:8080/admin/adminData")
                    .then(function (response) {
                        localStorage.setItem("adminData", JSON.stringify(response.data.adminData));
                        localStorage.setItem("role", response.data.adminData.role);
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                };
                this.updatePassword = function (currentPassword, newPassword) {
                    blockUI.start({
                        message:"Updating Password...."
                    })
                    return $http
                    .put("http://localhost:8080/admin/updatePassword", {
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
            this.getBrands = function () {
                return $http.get("http://localhost:8080/admin/brand/getAll", {
                    page: 1,
                    limit: 9
                })
                    .then(function (res) {
                        return res.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            };
            this.editBrand = function (brand) {
                blockUI.start({
                    message:"Brand Updated Successfully...."
                })
                return $http
                    .put("http://localhost:8080/admin/brand/edit", {
                        brandId: brand._id,
                        name: brand.name,
                        email: brand.email,
                        isDisabled:brand.isDisabled
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
            this.getAllAdmins = function () {
                return $http
                .get("http://localhost:8080/admin/get/all")
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
            };
            this.getPermissions = function () {
                return $http
                .get("http://localhost:8080/admin/permissions/get")
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
            };
            this.editPermissions = function (data) {
                return $http
                .put("http://localhost:8080/admin/permissions/edit",{
                    adminId:data.adminId,
                    permissions:(data.permissions?data.permissions:[])
                })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
            };
            this.getServiceData = function () {
                return {
                    adminData: JSON.parse(localStorage.getItem("adminData")),
                    role: localStorage.getItem("role")
                }
            };
    })