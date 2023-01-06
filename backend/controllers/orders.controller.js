var orders = require("../models/order.model");

var outlets = require("../models/outlets.model");

var throwError = require("../utils/errors");
var orderUtils = require("../utils/orders.utils");
var utils = require("../utils/utils");

var async = require("async");

var sqsUtils = require("../utils/aws/sqs/utils");
var getSocketInstance = require("../utils/socket/socket.utils").getSocketInstance;

var ObjectId = require("mongoose").Types.ObjectId;

exports.placeOrder = function (req, res, next) {
    try {

        var role = req.user.role;
        var permissions = req.user.permissions;
        var customer = req.body.customer;
        var brand = req.body.brand;
        var outlet = req.body.outlet;
        var orderType = req.body.orderType;
        var assignedTable = req.body.assignedTable;
        var cartItems = req.body.cart;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Create Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        outlets
            .findOne({
                _id: outlet.id
            })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                sqsUtils.addTaskToQueue("ORDER_CREATION", {
                    MessageBody: {
                        outlet: outlet,
                        brand: brand,
                        customer: customer,
                        cartItems: cartItems,
                        assignedTable: assignedTable ? parseInt(assignedTable) : undefined,
                        orderType: orderType
                    }
                });
                return res.status(201).json({
                    message: "Creating Order, Order Status - Pending"
                })
            })
            .catch(function (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getAllOrders = function (req, res, next) {
    try {

        var role = req.user.role;
        var permissions = req.user.permissions;
        var brandId = req.query.brandId;
        var customerId = req.query.customerId;
        var status = req.query.status;
        var orderType = req.query.orderType;
        var limit = parseInt(req.query.limit);
        var page = parseInt(req.query.page);
        var outletId = req.query.outletId;
        var skip = (page - 1) * limit;

        var isUserAuthorized = (role === "customer" && customerId === req.user.userId.toString()) || utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var matchQuery = {};
        if (outletId) {
            matchQuery["outlet.id"] = outletId;
        }
        if (brandId) {
            matchQuery["brand.id"] = brandId;
        }
        if (orderType) {
            matchQuery["orderType"] = orderType;
        }
        if (status) {
            matchQuery["status"] = status;
        }
        if (customerId) {
            matchQuery["customer.customer._id"] = customerId;
        }
        console.log(matchQuery);
        async.parallel([
            function (cb) {
                return orders
                    .countDocuments(matchQuery)
                    .then(function (availableOrdersCount) {
                        cb(null, availableOrdersCount);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                return orders
                    .find(matchQuery)
                    .skip(skip)
                    .limit(limit)
                    .then(function (availableOrders) {
                        cb(null, availableOrders);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error, ordersData) {
            if (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "orders fetched successfully",
                orders: ordersData[1],
                totalOrders: ordersData[0]
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.changeStatus = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;
        var status = req.body.status;
        var orderId = req.body.orderId;
        var outletId = req.body.outletId;
        var currentOrderData;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        orders
            .updateOne({
                _id: ObjectId(orderId)
            }, {
                $set: {
                    status: status
                }
            })
            .then(function () {
                return orders.findOne({
                    _id: ObjectId(orderId)
                });
            })
            .then(function (orderData) {
                currentOrderData = orderData;
                var socketInstance = getSocketInstance();
                socketInstance.to(orderData.customer.customer._id.toString()).emit("orderStatusChanged", {
                    orderData: orderData,
                    message: "Highlighted Order's Status is Changed!"
                })
                return outlets.findOne({
                    _id: outletId
                })
            })
            .then(function (outletData) {
                if (status === "Closed") {
                    orderUtils.updateTable(outletId, currentOrderData.assignedTable, {
                        isAssigned: false,
                        assignedOrderId: null
                    })
                }
                return outletData.save();
            })
            .then(function (outletData) {
                return res.status(200).json({
                    message: "order updated successfully",
                    orderData: currentOrderData
                })
            })
            .catch(function (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.editOrder = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;

        var outletId = req.user.userId;
        var orderId = req.body.orderId;
        var orderedItems = req.body.orderedItems;
        var tableToAssign = req.body.tableToAssign;

        var currentOrderData;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        // find order and check if it's dine in type order 
        var dataToUpdate = {
            orderedItems: orderedItems
        };
        if (tableToAssign) {
            dataToUpdate["assignedTable"] = tableToAssign;
        }

        orders.findOne({
            _id: ObjectId(orderId)
        })
            .then(function (orderData) {
                if (!orderData) {
                    throwError("Dine In Order is editable only! or order doesn't exist", 404);
                }
                currentOrderData = orderData;
                return orders.updateOne({
                    _id: ObjectId(orderId),
                    orderType: "Dine In"
                }, {
                    $set: dataToUpdate
                })
            })
            .then(function () {
                return orderUtils.changeUserTable(tableToAssign, currentOrderData, outletId);
            })
            .then(function () {
                return res.status(200).json({
                    message: "order updated successfully",
                })
            })
            .catch(function (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
