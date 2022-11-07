var outlets = require("../models/outlets.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");
const usersModel = require("../models/users.model");

require("dotenv").config("./.env");

exports.registerOutlet = function (req, res, next) {
    try {
        console.log("hello.......");
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        console.log(req.user);
        if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        outlets.findOne({
            email: email
        })
            .then(function (outletData) {
                if (outletData) {
                    throwError("outlet email already exist", 403);
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
                    password: hashedPassword
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
        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                return res.status(200).json({
                    message: "success",
                    outletData: outletData
                });
            })
            .catch(function (error) {
                let statusCode = error.cause ? error.cause.statusCode : 500;
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
        var outletId = req.user.userId;
        var status = req.query.status;
        var limit = req.query.limit;
        var page = req.query.page;

        var skip = (page - 1)*limit;

        outlets.findById(outletId)
            .then(function (outletData) {
                if(!outletData){
                    throwError("outlet doesn't exist",404);
                }
                var outletName = outletData.name;
                var matchQuery = {
                    "orders.outletName": outletName,
                };
                if (status) {
                    matchQuery["status"] = status;
                }
                return usersModel
                    .aggregate([
                        {
                            $unwind: "$orders"
                        },
                        {
                            $match: matchQuery
                        }
                    ])
            })
            .then(function (matchedOrders) {
                return res.status(200).json({
                    message: "orders fetched successfully",
                    orders: matchedOrders
                })
            })
            .catch(function (error) {
                let statusCode = error.cause ? error.cause.statusCode : 500;
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