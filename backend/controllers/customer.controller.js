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