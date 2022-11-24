var admin = require("../models/admin.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");
const brandsModel = require("../models/brands.model");

require("dotenv").config("./.env");

exports.registerAdmin = function (req, res, next) {
    try {
        if (req.user.role !== "superAdmin") {
            throwError("Access Denied!",403);
        }
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        admin.findOne({
            email: email
        })
            .then(function (adminData) {
                if (adminData) {
                    throwError("admin email already exist",403);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(password, salt);
            })
            .then(function (hashedPassword) {
                var newAdmin = new admin({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    role: "superAdmin"
                });
                return newAdmin.save();
            })
            .then(function (adminData) {
                return res.status(201).json({
                    message: "admin registered successfully",
                    adminData: adminData
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

exports.loginAdmin = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;
        var adminDetails;
        admin.findOne({
            email: email
        })
            .then(function (adminData) {
                if (!adminData) {
                    throwError("admin doesn't exist",404);
                }
                adminDetails = adminData;
                return adminData;
            })
            .then(function (adminData) {
                return bcrypt.compare(password, adminData.password);
            })
            .then(function (result) {
                if (!result) {
                    throwError("incorrect password",401);
                }
                return jwt.sign({
                    email: email
                }, process.env.AUTH_SECRET, {
                    expiresIn: "15h"
                })
            })
            .then(function (jwtToken) {
                return res.status(200).json({
                    message: "admin logged in successfully",
                    token: jwtToken,
                    adminData:adminDetails
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

exports.getAdminData = function (req,res,next) {
    try {
        var adminId = req.user.userId;

        if (req.user.role !== "superAdmin") {
            throwError("Access Denied!",403);
        }

        admin.findOne({
            _id:adminId
        })
        .then(function (adminData) {
            if(!adminData){
                throwError("admin doesn't exist",404);
            }
            return res.status(200).json({
                message:"success",
                adminData:adminData
            });
        })
        .catch(function (error) {
            var statusCode = error.cause ? error.cause.statusCode : 500;
            return res.status(statusCode).json({
                message:error.message
            })
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

exports.editBrand = function (req,res,next) {
    try {
        if (req.user.role !== "superAdmin") {
            throwError("Access Denied!",403);
        }

        var brandId = req.body.brandId;
        var isDisabled = req.body.isDisabled;
        var name = req.body.name;
        var email = req.body.email;

        var dataToUpdate = {};

        if(name){
            dataToUpdate["name"] = name;
        }
        if(email){
            dataToUpdate["email"] = email;
        }
        if(isDisabled){
            dataToUpdate["isDisabled"] = isDisabled;
        }

        brandsModel.updateOne({
            _id:brandId
        },{
            $set:dataToUpdate
        })
        .then(function () {
            return res.status(200).json({
                message:"brand data updated successfully"
            })
        })
        .catch(function (error) {
            var statusCode = error.cause ? error.cause.statusCode : 500;
            return res.status(statusCode).json({
                message:error.message
            })
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}