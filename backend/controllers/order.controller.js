var orderModel = require("../models/orders.model");

var cartModel = require("../models/cart.model");

exports.checkoutFromCart = function (req,res,next) {
    try {
        var userId = req.user.userId;
        var cartItems;

        cartModel.findOne({
            userId:userId
        })
        .populate("cartItems.foodItemId")
        .then(function (cartData) {
            if(!cartData){
                return res.status(404).json({
                    message:"no cart found!"
                })
            }
            cartItems = cartData.cartItems;
            cartData.cartItems = [];
            return cartData.save();
        })
        .then(function (cartData) {
            let totalPrice = cartItems.reduce(function (priceTillNow, currentCartItem) {
                return priceTillNow + (currentCartItem.quantity * currentCartItem.foodItemId.price)
            });
            let newOrder = new orderModel({
                userId:userId,
                totalPrice:totalPrice,
                outletId:cartData.outletId,
                orderedItems:cartItems
            })
            return newOrder.save();
        })
        .then(function (orderData) {
            return res.status(201).json({
                message:"order created successfully",
                orderData
            })
        })
        .catch(function (error) {
            return res.status(500).json({
                message:error.message
            })
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}