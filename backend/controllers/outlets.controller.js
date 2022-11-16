var outlets = require("../models/outlets.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");

require("dotenv").config("./.env");

exports.registerOutlet = function (req, res, next) {
    try {

        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var brand = req.body.brand;

        outlets.findOne({
            email: email
        })
            .then(function (outletData) {
                if (outletData) {
                    throwError("outlet email already exist", 404);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(password, salt);
            })
            .then(function (hashedPassword) {
                var newOutlet = new outlets({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    brand:brand
                });
                return newOutlet.save();
            })
            .then(function (outletData) {
                return res.status(201).json({
                    message: "outlet registered successfully",
                    outletData: outletData
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

exports.loginOutlet = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;
        var outletDetails;
        outlets.findOne({
            email: email
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                outletDetails = outletData;
                return outletData;
            })
            .then(function (outletData) {
                return bcrypt.compare(password, outletData.password);
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
                    message: "outlet logged in successfully",
                    token: jwtToken,
                    outletData:outletDetails
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

exports.getOutletData = function (req, res, next) {
    try {
        var outletId = req.user.userId;
        
        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                return res.status(200).json({
                    message: "outlet data fetched successfully",
                    outletData: outletData
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
        var category = req.body.category;
        var subCategory = req.body.subCategory;
        var outletName = req.body.outletName;
        var outletId = req.user.userId;
        // if item already in cart , increase quantity, else add it.
        outlets.findById(outletId)
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist",404);
                }
                var userCart = outletData.cart;

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
                        category:category,
                        subCategory:subCategory,
                        quantity: 1
                    })
                }
                outletData.cart = userCart;
                return outletData.save();
            })
            .then(function (outletData) {
                return res.status(200).json({
                    cartData: outletData.cart,
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
        var outletId = req.user.userId;

        outlets.findById(outletId)
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't found", 404);
                }
                var userCart = outletData.cart;
                var existingItemIndex = userCart.findIndex(function (cartItem) {
                    return cartItem.foodName === foodItemName;
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
                outletData.cart = userCart;
                return outletData.save();
            })
            .then(function (outletData) {
                return res.status(200).json({
                    message: "cart saved successfully!",
                    cartData: outletData.cart
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

