var taxesModel = require("../models/taxes.model").model;

var throwError = require("../utils/errors");

exports.addTax = function (req, res, next) {
    try {
        var taxName = req.body.name;
        var taxPercentageRange = req.body.percentageRange;

        var role = req.user.role;

        if (role !== 'superAdmin' && role !== 'brand') {
            return res.status(401).json({
                message: "tax added successfully"
            })
        }

        taxesModel.findOne({
            name: {
                $regex: new RegExp(taxName),
                $options:"i"
            }
        })
            .then(function (tax) {
                if (tax) {
                    throwError("tax already exist!", 409);
                }
                var newTax = new taxesModel({
                    name: taxName,
                    percentageRange: taxPercentageRange
                });
                return newTax.save();
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

exports.getAllTaxes = function (req, res, next) {
    try {

        taxesModel
            .find()
            .then(function (taxes) {
                return res.status(200).json({
                    taxes: taxes,
                    message: "taxes fetched successfully"
                })
            })
            .catch(function (error) {
                console.log(error);
                return res.status(500).json({
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