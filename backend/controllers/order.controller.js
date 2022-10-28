var orderModel = require("../models/orders.model");

var cartModel = require("../models/cart.model");

var throwError = require("../utils/errors");

exports.checkoutFromCart = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var cartItems;

        cartModel.findOne({
            userId: userId
        })
            .populate("cartItems.foodItemId")
            .then(function (cartData) {
                if (!cartData) {
                    throwError("no cart found!", 404);
                }
                cartItems = cartData.cartItems;
                cartData.cartItems = [];
                return cartData.save();
            })
            .then(function (cartData) {
                let totalPrice = cartItems.reduce(function (priceTillNow, currentCartItem) {
                    return priceTillNow + (currentCartItem.quantity * currentCartItem.foodItemId.price)
                });
                let orderedItems = cartItems.map(function (cartItem) {
                    return {
                        foodName: cartItem.foodItemId.name,
                        price: cartItem.foodItemId.price,
                        quantity: cartItem.quantity
                    };
                })
                let newOrder = new orderModel({
                    userId: userId,
                    totalPrice: totalPrice,
                    outletId: cartData.outletId,
                    orderedItems: orderedItems
                })
                return newOrder.save();
            })
            .then(function (orderData) {
                return res.status(201).json({
                    message: "order created successfully",
                    orderData
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