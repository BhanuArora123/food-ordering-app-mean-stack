

appModule
    .service("orderService", function ($http, $rootScope, userService, blockUI) {
        this.placeOrder = function (customer, outletData, brandData, orderType, assignedTable, cart, offers) {
            blockUI.start({
                message: "Placing Order..."
            })
            return $http.post("http://localhost:8080/orders/placeOrder", {
                cart: cart,
                customer: {
                    customer: {
                        name: customer.name,
                        phoneNumber: customer.phoneNumber,
                        outletId: outletData.id,
                        brandId: brandData.id
                    },
                    paidVia: customer.paidVia
                },
                brand: {
                    id: brandData.id,
                    name: brandData.name
                },
                outlet: {
                    id: outletData.id,
                    name: outletData.name
                },
                orderType: orderType,
                assignedTable: (assignedTable === 'None' ? undefined : assignedTable),
                offersUsed:offers
            })
                .then(function (res) {
                    blockUI.stop();
                    localStorage.setItem("cart", JSON.stringify(new Map()));
                    return res.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    localStorage.setItem("cart", JSON.stringify(new Map()));
                    console.log(error);
                })
        };
        this.getAllOrders = function (status, type, customerId, page, limit) {
            blockUI.start({
                message: "Loading..."
            })
            console.log(arguments);
            var brand,brandData,outletData;
            var userData = userService.userData();
            if(userData){
                console.log("brand index",$rootScope.currentBrandIndex);
                brandData = userData.brands ? userData.brands[$rootScope.currentBrandIndex] : undefined;
                outletData = userData.outlets ? userData.outlets[$rootScope.currentOutletIndex] : undefined;
            }
            var queryParam = {
                page: page,
                limit: limit
            };
            if (brandData) {
                brand = {
                    id: brandData.id,
                    name: brandData.name
                };
            }
            if (outletData) {
                brand = outletData.brand;
                queryParam["outletId"] = outletData.id;
            }
            if (status) {
                queryParam["status"] = status;
            }
            queryParam["orderType"] = type;
            queryParam["customerId"] = customerId;
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
        this.changeStatus = function (status, orderId,outletId) {
            return $http.put("http://localhost:8080/orders/changeStatus", {
                status: status,
                orderId: orderId,
                outletId:outletId
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