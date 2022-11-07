var users = require("../models/users.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");

require("dotenv").config("./.env");

exports.registerUser = function (req, res, next) {
    try {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        users.findOne({
            email: email
        })
            .then(function (userData) {
                console.log(userData);
                if (userData) {
                    throwError("user email already exist", 404);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(password, salt);
            })
            .then(function (hashedPassword) {
                var newUser = new users({
                    name: name,
                    email: email,
                    password: hashedPassword
                });
                return newUser.save();
            })
            .then(function (userData) {
                return res.status(201).json({
                    message: "user registered successfully",
                    userData: userData
                })
            })
            .catch(function (error) {
                console.log(error.cause);
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

exports.loginUser = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;
        var userDetails;
        users.findOne({
            email: email
        })
            .then(function (userData) {
                if (!userData) {
                    throwError("user doesn't exist", 404);
                }
                userDetails = userData;
                return userData;
            })
            .then(function (userData) {
                return bcrypt.compare(password, userData.password);
            })
            .then(function (result) {
                if (!result) {
                    throwError("unauthorised!", 401);
                }
                return jwt.sign({
                    email: email
                }, process.env.AUTH_SECRET, {
                    expiresIn: "15h"
                })
            })
            .then(function (jwtToken) {
                return res.status(200).json({
                    message: "user logged in successfully",
                    token: jwtToken,
                    userData:userDetails
                });
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
        });
    }
}

exports.getUserData = function (req, res, next) {
    try {
        var userId = req.user.userId;
        // console.log(req.user);
        users.findOne({
            _id: userId
        })
            .then(function (userData) {
                if (!userData) {
                    throwError("user doesn't exist", 404);
                }
                return res.status(200).json({
                    message: "user data fetched successfully",
                    userData: userData
                });
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

exports.addToCart = function (req, res, next) {
    try {
        var foodItemName = req.body.foodItemName;
        var foodItemPrice = req.body.foodItemPrice;
        var outletName = req.body.outletName;
        var userId = req.user.userId;
        // if item already in cart , increase quantity, else add it.
        users.findById(userId)
            .then(function (userData) {
                if (!userData) {
                    throwError("user doesn't exist",404);
                }
                var userCart = userData.cart;
                // reseting cart if outlet is not same
                if(userCart.length > 0 && outletName !== userCart[0].outletName){
                    userCart = [];
                }
                // check if cart item exist 
                var existingItemIndex = userCart
                    .findIndex(function (cartItem) {
                        return cartItem.foodName === foodItemName;
                    });
                if (existingItemIndex !== -1) {
                    userCart[existingItemIndex].quantity++;
                }
                else {
                    userCart.push({
                        foodName:foodItemName,
                        foodPrice:foodItemPrice,
                        outletName:outletName,
                        quantity: 1
                    })
                }
                userData.cart = userCart;
                return userData.save();
            })
            .then(function (userData) {
                return res.status(200).json({
                    cartData: userData.cart,
                    message: "item added to cart successfully"
                })
            })
            .catch(function (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

exports.removeFromCart = function (req, res, next) {
    try {
        var foodItemName = req.body.foodItemName;
        var outletName = req.body.outletName;
        var userId = req.user.userId;

        users.findById(userId)
            .then(function (userData) {
                if (!userData) {
                    throwError("user doesn't found", 404);
                }
                var userCart = userData.cart;
                var existingItemIndex = userCart.findIndex(function (cartItem) {
                    return cartItem.foodName === foodItemName && cartItem.outletName === outletName;
                })
                if (existingItemIndex === -1) {
                    throwError("cart item not found!", 404);
                }
                else {
                    if (userCart[existingItemIndex].quantity === 1) {
                        userCart.splice(existingItemIndex, 1);
                    }
                    else {
                        userCart[existingItemIndex].quantity--;
                    }
                }
                userData.cart = userCart;
                return userData.save();
            })
            .then(function (userData) {
                return res.status(200).json({
                    message: "cart saved successfully!",
                    cartData: userData.cart
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
        });
    }
}

exports.placeOrder = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var cartItems;

        users.findById(userId)
            .then(function (userData) {
                if (!userData || !userData.cart.length) {
                    throwError(userData?"no item in cart":"user doesn't exist", userData?400:404);
                }
                cartItems = userData.cart;
                userData.cart = [];
                return userData.save();
            })
            .then(function (userData) {
                var totalPrice = cartItems.reduce(function (priceTillNow, currentCartItem) {
                    return priceTillNow + (currentCartItem.quantity * currentCartItem.foodPrice)
                },0);
                var orderedItems = cartItems.map(function (cartItem) {
                    return {
                        foodName: cartItem.foodName,
                        foodPrice: cartItem.foodPrice,
                        quantity: cartItem.quantity,
                    };
                })
                userData.orders.push({
                    orderedItems:orderedItems,
                    amountPaid:totalPrice,
                    outletName:cartItems[0].outletName,
                    createdAt:new Date()
                });
                return userData.save();
            })
            .then(function (userData) {
                return res.status(201).json({
                    message: "order created successfully",
                    orderData:userData.orders
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