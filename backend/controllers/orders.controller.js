var orders = require("../models/order.model");

var outlets = require("../models/outlets.model");

var throwError = require("../utils/errors");
var orderUtils = require("../utils/orders.utils");

var ObjectId = require("mongoose").Types.ObjectId;

exports.placeOrder = function (req, res, next) {
    try {
        var outletId = req.user.userId;
        var customer = req.body.customer;
        var brand = req.body.brand;
        var outlet = req.body.outlet;
        var orderType = req.body.orderType;
        var assignedTable = req.body.assignedTable;

        var cartItems;

        outlets.findById(outletId)
            .then(function (outletData) {
                if (!outletData || !outletData.cart.length) {
                    throwError(outletData ? "no item in cart" : "outlet doesn't exist", outletData ? 400 : 404);
                }
                cartItems = outletData.cart;
                outletData.cart = [];
                return outletData.save();
            })
            .then(function (outletData) {
                var totalPrice = cartItems.reduce(function (priceTillNow, currentCartItem) {
                    return priceTillNow + (currentCartItem.quantity * currentCartItem.foodPrice)
                }, 0);
                var orderedItems = cartItems.map(function (cartItem) {
                    return {
                        foodName: cartItem.foodName,
                        foodPrice: cartItem.foodPrice,
                        quantity: cartItem.quantity,
                        subCategory: cartItem.subCategory,
                        category: cartItem.category
                    };
                })
                var newOrder = new orders({
                    orderedItems: orderedItems,
                    amountPaid: totalPrice,
                    outletName: cartItems[0].outletName,
                    createdAt: new Date(),
                    outlet: outlet,
                    customer: customer,
                    brand: brand,
                    orderType: orderType ? orderType : "Dine In",
                    assignedTable:(assignedTable && orderType === "Dine In")?parseInt(assignedTable):undefined
                });
                // update assigned table
                outlets.updateOne({
                    _id:ObjectId(outletId)
                },{
                    $set:{
                        tables:{
                            $map:{
                                input:"$tables",
                                as:"table",
                                in:{
                                    $mergeObjects:[
                                        "$$table",
                                        {
                                            isAssigned:{
                                                $cond:[
                                                    {
                                                        $eq:["$$table.tableId",parseInt(assignedTable)]
                                                    },
                                                    true,
                                                    false
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                })
                .then(function (data) {
                    console.log(data);
                })
                return newOrder.save();
            })
            .then(function (orderData) {
                return res.status(201).json({
                    message: "order created successfully",
                    orderData: orderData
                })
            })
            .catch(function (error) {
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
        var brandName = req.query.brandName;
        var status = req.query.status;
        var orderType = req.query.orderType;
        var limit = parseInt(req.query.limit);
        var page = parseInt(req.query.page);

        var skip = (page - 1) * limit;

        var matchQuery = {};
        if (orderType) {
            matchQuery["orderType"] = orderType;
        }
        if (status) {
            matchQuery["status"] = status;
        }
        if (brandName) {
            matchQuery["brand.name"] = brandName;
        }
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

        orders
            .updateOne({
                _id: ObjectId(orderId)
            }, {
                $set: {
                    status: status
                }
            })
            .then(function (orderData) {
                return res.status(200).json({
                    message: "order updated successfully",
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

exports.editOrder = function (req, res, next) {
    try {
        var orderId = req.body.orderId;

        var orderedItems = req.body.orderedItems;

        // find order and check if it's dine in type order 

        orders.updateOne({
            _id: ObjectId(orderId),
            orderType: "Dine In"
        }, {
            $set: {
                orderedItems: orderedItems
            }
        })
            .then(function (orderData) {
                if (!orderData) {
                    throwError("Dine In Order is editable only! or order doesn't exist", 404);
                }
                return res.status(200).json({
                    message: "order updated successfully",
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