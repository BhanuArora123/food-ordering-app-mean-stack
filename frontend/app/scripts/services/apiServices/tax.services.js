

appModule
    .service("taxService", function ($http) {
        this.getTaxes = function () {
            return $http
                .get("http://localhost:8080/tax/get/all")
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        this.addTax = function (tax) {
            return $http
                .post("http://localhost:8080/tax/add", {
                    name: tax.name,
                    percentageRange: tax.percentageRange
                })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    })