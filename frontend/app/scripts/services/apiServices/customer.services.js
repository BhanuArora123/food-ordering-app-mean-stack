

appModule.service("customerService", function ($http,blockUI) {
    this.getCustomerByPhone = function (phoneNumber) {
        blockUI.start({
            message:"fetching customer details..."
        })
        return $http
            .get("http://localhost:8080/customer/get/" + phoneNumber)
            .then(function (response) {
                blockUI.stop();
                return response.data;
            })
            .catch(function (error) {
                blockUI.stop();
                console.log(error);
            })
    };
    this.getAllCustomers = function () {
        return $http
        .get("http://localhost:8080/customer/all/get")
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        })
    };
})