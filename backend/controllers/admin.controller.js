var admin = require("../models/admin.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

require("dotenv").config("./.env");

exports.registerAdmin = function (req, res, next) {
    try {
        if (req.role !== "superadmin") {
            return res.status(401).json({
                message: "Access Denied!"
            })
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
                    return res.status(403).json({
                        message: "admin email already exist"
                    });
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

exports.loginAdmin = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;

        admin.findOne({
            email: email
        })
            .then(function (adminData) {
                if (!adminData) {
                    return res.status(404).json({
                        message: "admin doesn't exist"
                    });
                }
                return adminData;
            })
            .then(function (adminData) {
                return bcrypt.compare(password, adminData.password);
            })
            .then(function (result) {
                if (!result) {
                    return res.status(401).json({
                        message: "unauthorised!"
                    });
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
                return res.status(500).json({
                    message: error.message
                });
            })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}