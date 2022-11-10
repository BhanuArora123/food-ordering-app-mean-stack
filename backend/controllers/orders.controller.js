var orders = require("../models/order.model");

var users = require("../models/users.model");

var outlet = require("../models/order.model");

var throwError = require("../utils/errors");
var orderUtils= require("../utils/orders.utils");

exports.placeOrder = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var cartItems;

        users.findById(userId)
            .then(function (userData) {
                if (!userData || !userData.cart.length) {
                    throwError(userData ? "no item in cart" : "user doesn't exist", userData ? 400 : 404);
                }
                cartItems = userData.cart;
                userData.cart = [];
                return userData.save();
            })
            .then(function (userData) {
                var totalPrice = cartItems.reduce(function (priceTillNow, currentCartItem) {
                    return priceTillNow + (currentCartItem.quantity * currentCartItem.foodPrice)
                }, 0);
                var orderedItems = cartItems.map(function (cartItem) {
                    return {
                        foodName: cartItem.foodName,
                        foodPrice: cartItem.foodPrice,
                        quantity: cartItem.quantity,
                        subCategory:cartItem.subCategory,
                        category:cartItem.category
                    };
                })
                var newOrder = new orders({
                    orderedItems: orderedItems,
                    amountPaid: totalPrice,
                    outletName: cartItems[0].outletName,
                    createdAt: new Date(),
                    userId: userId
                });
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

        // authorizing
        if (req.user.role !== "superAdmin" && req.user.role !== "admin" && req.user.role !== "outlet") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var outletName = req.query.oultetName;
        var status = req.query.status;
        var limit = parseInt(req.query.limit);
        var page = parseInt(req.query.page);

        var skip = (page - 1) * limit;

        var matchQuery = {};
        if (status) {
            matchQuery["status"] = status;
        }
        if (outletName) {
            matchQuery["outletName"] = outletName;
        }
        orderUtils
            .groupBasedOnCategory(matchQuery,skip,limit)
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