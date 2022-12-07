var outlets = require("../models/outlets.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");
const { sendEmail } = require("../utils/email.utils");
const brandsModel = require("../models/brands.model");

require("dotenv").config("./.env");

exports.registerOutlet = function (req, res, next) {
    try {

        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var brand = req.body.brand;

        var emailContent = `Hi ${name} , Your Outlet Registration is successful, please use below creds to access the portal!
            Email:${email}
            Password:${password}
        `;

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
                    brand: brand
                });
                return newOutlet.save();
            })
            .then(function (outletData) {
                sendEmail(email, 'Outlet Registration Success!', emailContent);
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
                return brandsModel.findOne({
                    _id: outletData.brand.id,
                    isDisabled:false
                }, {
                    name: 1,
                    email: 1
                });
            })
            .then(function (brandData) {
                if(!brandData){
                    throwError("brand is disabled or it doesn't exist!",404);
                }
                return outletDetails;
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
                    outletData: outletDetails
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

        var page = req.query.page ? parseInt(req.query.skip) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 9;

        var skip = (page - 1) * limit;

        outlets.findOne({
            _id: outletId
        }, {
            tables: {
                $slice: [skip, limit]
            }
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

exports.getTables = function (req, res, next) {
    try {
        var isAssigned = req.query.isAssigned;
        var page = req.query.page ? parseInt(req.query.skip) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 9;

        var skip = (page - 1) * limit;

        var outletId = req.user.userId;


        outlets.findOne({
            _id: outletId
        },
            {
                tables: {
                    $slice: [skip, limit]
                }
            })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }

                var tables = outletData.tables;

                if (isAssigned !== undefined) {
                    tables = tables.filter(function (table) {
                        return table.isAssigned.toString() === isAssigned;
                    })
                }

                return res.status(200).json({
                    message: "tables fetched successfully",
                    tables: tables
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

exports.addTable = function (req, res, next) {
    try {
        var tableId = req.body.tableId;
        var assignedOrderId = req.body.assignedOrderId;

        var outletId = req.user.userId;

        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                outletData.tables.push({
                    tableId: tableId,
                    assignedOrderId: assignedOrderId
                })
                console.log(outletData.tables);
                return outletData.save();
            })
            .then(function (outletData) {
                return res.status(200).json({
                    message: "table added successfully",
                    tables: outletData.tables
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
        console.log(error);
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
        var taxes = req.body.taxes;
        var outletId = req.user.userId;
        // if item already in cart , increase quantity, else add it.
        outlets.findById(outletId)
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
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
                        foodName: foodItemName,
                        foodPrice: foodItemPrice,
                        outletName: outletName,
                        category: category,
                        subCategory: subCategory,
                        quantity: 1,
                        taxes:taxes
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

exports.updatePassword = function (req, res, next) {
    try {
        var outletId = req.user.userId || req.body.outletId;
        var currentPassword = req.body.currentPassword;
        var newPassword = req.body.newPassword;

        if (req.user.role !== 'outlet' && req.user.role !== 'brand') {
            return res.status(403).json({
                message: "Access Denied!"
            })
        }

        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                console.log(currentPassword, outletData.password)
                return bcrypt.compare(currentPassword, outletData.password)
            })
            .then(function (isPasswordCorrect) {
                console.log("password -", isPasswordCorrect);
                if (!isPasswordCorrect) {
                    throwError("incorrect current password", 401);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(newPassword, salt);
            })
            .then(function (hashedPassword) {
                return outlets.updateOne({
                    _id: outletId
                }, {
                    $set: {
                        password: hashedPassword
                    }
                });
            })
            .then(function () {
                return res.status(200).json({
                    message: "password updated successfully!"
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
