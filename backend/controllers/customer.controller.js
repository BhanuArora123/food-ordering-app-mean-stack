var customerModel = require("../models/customer.model").model;

var throwError = require("../utils/errors");

require("dotenv").config("../.env");

var jwt = require("jsonwebtoken");

var redisUtils = require("../utils/redis/redis.utils");

exports.getCustomerData = function (req, res, next) {
    try {
        var phoneNumber =req.query.phoneNumber?req.query.phoneNumber:req.user.phoneNumber;

        redisUtils
        .getValue(`customer-${phoneNumber}`)
        .then(function (customerData) {
            if(!customerData){
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
                if(!req.isRedisResponse){
                    redisUtils.setValue(`customer-${phoneNumber}`,JSON.stringify(customerData));
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
        var brandId = req.user.userId;
        var role = req.user.role;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var totalCustomers;


        var isBrandAuthorized = req.user.permissions.find(function (permission) {
            return permission.permissionName === 'Manage Customers';
        })

        if (!isBrandAuthorized && role !== 'superAdmin') {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        customerModel
            .countDocuments({
                brandId: brandId
            })
            .then(function (availableCustomers) {
                totalCustomers = availableCustomers;
                return customerModel.find({
                    brandId: brandId
                })
                    .skip(skip)
                    .limit(limit)
            })
            .then(function (allCustomers) {
                return res.status(200).json({
                    customers: allCustomers,
                    totalCustomers:totalCustomers
                })
            })
            .catch(function (error) {
                return res.status(500).json({
                    message: error.message
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
                    phoneNumber: phoneNumber
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

// image compress 