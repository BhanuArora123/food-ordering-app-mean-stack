var brands = require("../models/brands.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");
var outletsModel = require("../models/outlets.model");

require("dotenv").config("./.env");

exports.registerBrand = function (req, res, next) {
    try {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        brands.findOne({
            email: email
        })
            .then(function (brandData) {
                if (brandData) {
                    throwError("brand email already exist", 403);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(password, salt);
            })
            .then(function (hashedPassword) {
                var newBrand = new brands({
                    name: name,
                    email: email,
                    password: hashedPassword
                });
                return newBrand.save();
            })
            .then(function (brandData) {
                return res.status(201).json({
                    message: "brand registered successfully",
                    brandData: brandData
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

exports.loginBrand = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;
        var brandDetails;
        brands.findOne({
            email: email
        })
            .then(function (brandData) {
                if (!brandData) {
                    throwError("brand doesn't exist", 404);
                }
                brandDetails = brandData;
                return brandData;
            })
            .then(function (brandData) {
                return bcrypt.compare(password, brandData.password);
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
                    message: "brand logged in successfully",
                    token: jwtToken,
                    brandData: brandDetails
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

exports.getBrandData = function (req, res, next) {
    try {
        var brandId = req.user.userId;
        brands.findOne({
            _id: brandId
        })
            .then(function (brandData) {
                if (!brandData) {
                    throwError("brand doesn't exist", 404);
                }
                return res.status(200).json({
                    message: "success",
                    brandData: brandData
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

exports.editOutlet = function (req, res, next) {
    try {
        var role = req.user.role;

        if (role !== "superAdmin" && role !== "brand") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var outletId = req.user.userId;

        var name = req.user.outlet.name;
        var email = req.user.outlet.email;

        var dataToUpdate = {};

        if (name) {
            dataToUpdate["name"] = name;
        }
        if (email) {
            dataToUpdate["email"] = email;
        }

        outletsModel.updateOne({
            _id: outletId
        }, {
            $set: dataToUpdate
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                return foodModel.updateMany({
                    "outlet.id": outletId
                }, {
                    $set: {
                        "outlet.name": outletData.name
                    }
                })
            })
            .then(function () {
                return res.status(200).json({
                    message: "outlet updated successfully"
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