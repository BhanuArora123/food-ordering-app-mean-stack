var orders = require("../models/order.model");

var outlets = require("../models/outlets.model");

var throwError = require("../utils/errors");
var orderUtils = require("../utils/orders.utils");

const sqsUtils = require("../utils/aws/sqs/utils");

var ObjectId = require("mongoose").Types.ObjectId;

var customerModel = require("../models/customer.model").model

exports.placeOrder = function (req, res, next) {
    try {
        var outletId = req.user.userId;
        var customer = req.body.customer;
        var brand = req.body.brand;
        var outlet = req.body.outlet;
        var orderType = req.body.orderType;
        var assignedTable = req.body.assignedTable;
        var cartItems = req.body.cart;

        var brandId;

        outlets.findById(outletId)
            .then(function (outletData) {
                if (!outletData || !outletData.cart.length) {
                    throwError(outletData ? "no item in cart" : "outlet doesn't exist", outletData ? 400 : 404);
                }
                brandId = outletData.brand.id;
                return customerModel.findOne({
                    phoneNumber:customer.customer.phoneNumber.toString()
                })
            })
            .then(function (customerData) {
                if(customerData){
                    if(customerData.name !== customer.customer.name){
                        throwError("a customer with this name and phone number already exist",409);
                    }
                    return customerData;
                }
                customer.customer.outletId = outletId;
                customer.customer.brandId = brandId;
                console.log(customer.customer);
                var newCustomer = new customerModel(customer.customer);
                return newCustomer.save();
            })
            .then(function (customerData) {
                var totalPrice = cartItems.reduce(function (priceTillNow, currentCartItem) {
                    return priceTillNow + (currentCartItem.quantity * currentCartItem.foodPrice)
                }, 0);
                var orderedItems = cartItems.map(function (cartItem) {
                    return {
                        foodName: cartItem.foodName,
                        foodPrice: cartItem.foodPrice,
                        quantity: cartItem.quantity,
                        subCategory: cartItem.subCategory,
                        category: cartItem.category,
                        taxes:cartItem.taxes,
                        foodItemId:cartItem.foodItemId
                    };
                })
                var newOrder = new orders({
                    orderedItems: orderedItems,
                    amountPaid: totalPrice,
                    outletName: cartItems[0].outletName,
                    createdAt: new Date(),
                    outlet: outlet,
                    customer: {
                        customer:customerData,
                        paidVia:customer.paidVia
                    },
                    brand: brand,
                    orderType: orderType ? orderType : "Dine In",
                });
                return newOrder.save();
            })
            .then(function (orderData) {
                sqsUtils.addTaskToQueue("ORDER_CREATION",{
                    MessageBody: {
                        brandId:brand.id,
                        outletName:outlet.name,
                        orderId:orderData._id,
                        assignedTable:parseInt(assignedTable),
                        outletId:outlet.id
                    }
                });
                return res.status(201).json({
                    message: "Creating Order, Order Status - Pending",
                    orderData: orderData
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

        var brandId = req.query.brandId;

        // authorizing
        if (req.user.role !== "superAdmin" && req.user.role !== "admin" && req.user.userId !== brandId && req.user.brandId !== brandId) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var status = req.query.status;
        var orderType = req.query.orderType;
        var limit = parseInt(req.query.limit);
        var page = parseInt(req.query.page);
        var outletId = req.query.outletId;

        var skip = (page - 1) * limit;

        var matchQuery = {
            "brand.id":brandId
        };
        console.log("order type - ",orderType);
        if (orderType) {
            matchQuery["orderType"] = orderType;
        }
        if (status) {
            matchQuery["status"] = status;
        }
        if(outletId){
            matchQuery["outlet.id"] = outletId;
        }
        console.log(matchQuery);
        orders
            .find(matchQuery)
            .skip(skip)
            .limit(limit)
            .then(function (matchedOrders) {
                return res.status(200).json({
                    message: "orders fetched successfully",
                    orders: matchedOrders
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
        var status = req.body.status;
        var orderId = req.body.orderId;
        var outletId = req.user.userId;
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