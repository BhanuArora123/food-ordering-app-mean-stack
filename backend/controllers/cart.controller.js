var cartModel = require("../models/cart.model");

exports.addToCart = function (req, res, next) {
    try {
        var foodItemId = req.body.foodItemId;
        var userId = req.user.userId;
        // if item already in cart , increase quantity, else add it.
        cartModel.findOne({
            userId: userId
        })
            .then(function (cartData) {
                if(!cartData){
                    cartData = new cartModel({
                        userId:userId,
                        cartItems:[]
                    });
                }
                var existingItemIndex = cartData.cartItems
                    .findIndex(function (cartItem) {
                        return cartItem.foodItemId.toString() === foodItemId.toString();
                    });
                if(existingItemIndex !== -1){
                    cartData.cartItems[existingItemIndex].quantity++;
                }
                else{
                    cartData.cartItems.push({
                        foodItemId:foodItemId,
                        quantity:1
                    })
                }
                return cartData.save();
            })
            .then(function (cartData) {
                return res.status(200).json({
                    cartData:cartData,
                    message:"item added to cart successfully"
                })
            })
            .catch(function (error) {
                console.log(error);
                return res.status(500).json({
                    message: error.message
                });
            });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

exports.removeFromCart = function (req,res,next) {
    try {
        var foodItemId = req.body.foodItemId;
        var userId = req.user.userId;
        
        cartModel.findOne({
            userId:userId
        })
        .then(function (cartData) {
            if(!cartData){
                return res.status(404).json({
                    message:"no cart found!"
                })
            }
            var userCart = cartData.cartItems;
            var existingItemIndex = userCart.findIndex(function (cartItem) {
                return cartItem.foodItemId.toString() === foodItemId.toString();
            })
            if(existingItemIndex === -1){
                return res.status(404).json({
                    message:"cart item not found!"
                });
            }
            else{
                if(userCart[existingItemIndex].quantity === 1){
                    userCart.splice(existingItemIndex,1);
                }
                else{
                    userCart[existingItemIndex].quantity--;
                }
            }
            return cartData.save();
        })
        .then(function (cartData){
            return res.status(200).json({
                message:"cart saved successfully!",
                cartData:cartData
            })
        })
        .catch(function (error) {
            return res.status(500).json({
                message:error.message
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}