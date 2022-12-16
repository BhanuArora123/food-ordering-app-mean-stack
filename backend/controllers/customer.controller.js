var customerModel = require("../models/customer.model").model;

var throwError = require("../utils/errors");

exports.getCustomerData = function (req, res, next) {
    try {
        var phoneNumber = req.params.phoneNumber;

        customerModel.findOne({
            phoneNumber: phoneNumber
        })
            .then(function (customerData) {
                if (!customerData) {
                    throwError("customer doesn't exist", 404);
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

exports.getAllCustomers = function (req,res,next) {
    try {
        var brandId = req.user.userId;
        var role = req.user.role;

        var isBrandAuthorized = req.user.permissions.find(function (permission) {
            return permission.permissionName === 'Manage Customers';
        })

        if(!isBrandAuthorized && role !== 'superAdmin'){
            return res.status(401).json({
                message:"Access Denied!"
            })
        }
        customerModel.find({
            brandId:brandId
        })
        .then(function (allCustomers) {
            return res.status(200).json({
                customers:allCustomers
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