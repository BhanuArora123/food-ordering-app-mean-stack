

appModule.service("customerService", function ($http,blockUI) {
    this.getCustomerByPhone = function (phoneNumber) {
        console.log(phoneNumber);
        blockUI.start({
            message:"fetching customer details..."
        })
        return $http
            .get("http://localhost:8080/customer/get",{
                params:{
                    phoneNumber:phoneNumber
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
    this.getAllCustomers = function (page,limit) {
        return $http
        .get("http://localhost:8080/customer/all/get",{
            page:page,
            limit:limit
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
        .post("http://localhost:8080/customer/login",{
            phoneNumber:phoneNumber
        })
        .then(function (res) {
            localStorage.setItem("role","customer");
            return res.data;
        })
        .catch(function (error) {
            console.log(error);
        })
    }
})