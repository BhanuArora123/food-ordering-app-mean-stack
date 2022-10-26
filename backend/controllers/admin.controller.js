var admin = require("../models/admin.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");

require("dotenv").config("./.env");

exports.registerAdmin = function (req, res, next) {
    try {
        if (req.role !== "superadmin") {
            throwError("Access Denied!",401);
        }
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var role = req.body.role;
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
                    role: (role ? role : "admin")
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

        admin.findOne({
            email: email
        })
            .then(function (adminData) {
                if (!adminData) {
                    throwError("admin doesn't exist",404);
                }
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
                    token: jwtToken
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