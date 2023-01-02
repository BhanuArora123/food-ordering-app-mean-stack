var customerModel = require("../models/customer.model").model;

var throwError = require("../utils/errors");

var async = require("async");

require("dotenv").config("../.env");

var jwt = require("jsonwebtoken");

var redisUtils = require("../utils/redis/redis.utils");

var utils = require("../utils/utils");

exports.getCustomerData = function (req, res, next) {
    try {
        var phoneNumber = req.query.phoneNumber ? req.query.phoneNumber : req.user.phoneNumber;

        redisUtils
            .getValue(`customer-${phoneNumber}`)
            .then(function (customerData) {
                if (!customerData) {
                    return customerModel.findOne({
                        phoneNumber: phoneNumber
                    })
                }
                req.isRedisResponse = true;
                return JSON.parse(customerData);
            })
            .then(function (customerData) {
                if (!customerData) {
                    throwError("customer doesn't exist", 404);
                }
                if (!req.isRedisResponse) {
                    redisUtils.setValue(`customer-${phoneNumber}`, JSON.stringify(customerData));
                }
                return res.status(200).json({
                    message: "customer details fetched",
                    customerData: customerData
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

exports.getAllCustomers = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;
        var brandId = req.query.userId;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var totalCustomers;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "customer"
        }, "Manage Brands");

        if (!isUserAuthorized && role !== "customer") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        async.parallel([
            function (cb) {
                customerModel.countDocuments({
                    brandId: brandId
                })
                    .then(function (availableCustomers) {
                        return cb(null, availableCustomers);
                    })
                    .catch(function (error) {
                        return cb(error);
                    })
            },
            function (cb) {
                return customerModel.find({
                    brandId: brandId
                })
                    .skip(skip)
                    .limit(limit)
                    .then(function (allCustomers) {
                        cb(null,allCustomers);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ],function (error, customersData) {
            if (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                customers: customersData[1],
                totalCustomers: customersData[0]
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.login = function (req, res, next) {
    try {
        var phoneNumber = req.body.phoneNumber;
        customerModel
            .findOne({
                phoneNumber: phoneNumber
            })
            .then(function (customerData) {
                if (!customerData) {
                    throwError("customer doesn't exist!", 404);
                }
                var token = jwt.sign({
                    phoneNumber: phoneNumber,
                    role: "customer",
                    userId: customerData._id
                }, process.env.AUTH_SECRET, {
                    expiresIn: "15h"
                })
                return res.status(200).json({
                    message: "customer login successfull!",
                    customerData: customerData,
                    token: token
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
