

appModule.service("customerService", function ($http, $rootScope, blockUI, userService) {
    this.getCustomerByPhone = function (phoneNumber) {
        var brandId = userService.userData()?.outlets ? userService.userData().outlets[$rootScope.currentOutletIndex].brand.id : undefined;
        blockUI.start({
            message: "fetching customer details..."
        })
        return $http
            .get("http://localhost:8080/customer/get", {
                params: {
                    phoneNumber: phoneNumber,
                    brandId: brandId
                }
            })
            .then(function (response) {
                blockUI.stop();
                return response.data;
            })
            .catch(function (error) {
                blockUI.stop();
                console.log(error);
            })
    };
    this.getAllCustomers = function (page, limit, brandId) {
        console.log(page, limit, brandId);
        return $http
            .get("http://localhost:8080/customer/all/get", {
                params: {
                    page: page,
                    limit: limit,
                    brandId: brandId
                }
            })
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            })
    };
    this.customerLogin = function (phoneNumber) {
        return $http
            .post("http://localhost:8080/customer/login", {
                phoneNumber: phoneNumber
            })
            .then(function (res) {
                localStorage.setItem("role", "customer");
                return res.data;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
})