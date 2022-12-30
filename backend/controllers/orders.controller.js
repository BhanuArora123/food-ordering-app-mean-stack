var orders = require("../models/order.model");

var outlets = require("../models/outlets.model");

var throwError = require("../utils/errors");
var orderUtils = require("../utils/orders.utils");
var utils = require("../utils/utils");

const sqsUtils = require("../utils/aws/sqs/utils");
const getSocketInstance = require("../utils/socket/socket.utils").getSocketInstance;

var ObjectId = require("mongoose").Types.ObjectId;

exports.placeOrder = function (req, res, next) {
    try {

        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"outlet"
        },"Create Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var customer = req.body.customer;
        var brand = req.body.brand;
        var outlet = req.body.outlet;
        var orderType = req.body.orderType;
        var assignedTable = req.body.assignedTable;
        var cartItems = req.body.cart;

        outlets
            .findOne({
                _id:outlet.id
            })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist",404);
                }
                sqsUtils.addTaskToQueue("ORDER_CREATION",{
                    MessageBody: {
                        outlet:outlet,
                        brand:brand,
                        customer:customer,
                        cartItems:cartItems,
                        assignedTable:assignedTable?parseInt(assignedTable):undefined,
                        orderType:orderType
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

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"outlet"
        },"Manage Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var brandId = req.query.brandId;
        var customerId = req.query.customerId;
        var status = req.query.status;
        var orderType = req.query.orderType;
        var limit = parseInt(req.query.limit);
        var page = parseInt(req.query.page);
        var outletId = req.query.outletId;
        var totalOrders;

        var skip = (page - 1) * limit;

        var matchQuery = {};
        if(brandId){
            matchQuery["brand.id"] = brandId;
        }
        if (orderType) {
            matchQuery["orderType"] = orderType;
        }
        if (status) {
            matchQuery["status"] = status;
        }
        if(outletId){
            matchQuery["outlet.id"] = outletId;
        }
        if(customerId){
            matchQuery["customer.customer._id"] = customerId;
        }
        console.log(matchQuery);
        orders
        .countDocuments(matchQuery)
        .then(function (availableOrders) {
            totalOrders = availableOrders;
            return orders
            .find(matchQuery)
            .skip(skip)
            .limit(limit)
        })
            .then(function (matchedOrders) {
                return res.status(200).json({
                    message: "orders fetched successfully",
                    orders: matchedOrders,
                    totalOrders:totalOrders
                })
            })
            .catch(function (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
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

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"outlet"
        },"Manage Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var status = req.body.status;
        var orderId = req.body.orderId;
        var outletId = req.body.outletId;
        var currentOrderData;

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
                socketInstance.to(orderData.customer.customer._id.toString()).emit("orderStatusChanged",{
                    orderData:orderData,
                    message:"Highlighted Order's Status is Changed!"
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

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"outlet"
        },"Manage Orders");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        
        var outletId = req.user.userId;
        var orderId = req.body.orderId;
        var orderedItems = req.body.orderedItems;
        var tableToAssign = req.body.tableToAssign;

        var currentOrderData;
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
                return orderUtils.changeUserTable(tableToAssign,currentOrderData,outletId);
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
