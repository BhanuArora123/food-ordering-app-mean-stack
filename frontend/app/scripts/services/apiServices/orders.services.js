

appModule
    .service("orderService", function ($http, brandService, outletService, blockUI) {
        this.placeOrder = function (customer, outletData, brandData, orderType, assignedTable) {
            blockUI.start({
                message: "Placing Order..."
            })
            return $http.post("http://localhost:8080/orders/placeOrder", {
                customer: {
                    customer:{
                        name:customer.name,
                        phoneNumber:customer.phoneNumber
                    },
                    paidVia:customer.paidVia
                },
                brand: {
                    id: brandData.id,
                    name: brandData.name
                },
                outlet: {
                    id: outletData._id,
                    name: outletData.name
                },
                orderType: orderType,
                assignedTable: (assignedTable === 'None'?undefined:assignedTable)
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
        this.getAllOrders = function (status, type) {
            blockUI.start({
                message: "Loading..."
            })
            var brand;
            var brandData = brandService.getServiceData().brandData;
            var outletData = outletService.getServiceData().outletData;
            if (brandData) {
                brand = {
                    id: brandData.id,
                    name: brandData.name
                };
            }
            if (outletData) {
                brand = outletData.brand;
            }
            var queryParam = {
                page: 1,
                limit: 9
            };
            if (status) {
                queryParam["status"] = status;
            }
            queryParam["orderType"] = type ? type : "Dine In";
            if (brand) {
                queryParam["brandId"] = brand.id;
                queryParam["brandName"] = brand.name;
            }
            return $http
                .get("http://localhost:8080/orders/getAllOrders", {
                    params: queryParam
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
        this.changeStatus = function (status, orderId) {
            return $http.put("http://localhost:8080/orders/changeStatus", {
                status: status,
                orderId: orderId
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.editOrder = function (orderId, orderedItems, tableToAssign) {
            blockUI.start({
                message: "Editing Order..."
            })
            return $http.put("http://localhost:8080/orders/edit", {
                orderId: orderId,
                orderedItems: orderedItems,
                tableToAssign: tableToAssign
            })
                .then(function (res) {
                    blockUI.stop();
                    return res.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                })
        }
    });