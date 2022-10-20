var outlets = require("../models/outlets.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

require("dotenv").config("./.env");

exports.registerOutlet = function (req, res, next) {
    if(req.role !== "superadmin" && req.role !== "admin"){
        return res.status(401).json({
            message:"Access Denied!"
        })
    }
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    outlets.findOne({
        email: email
    })
        .then(function (outletData) {
            if (outletData) {
                return res.status(403).json({
                    message: "outlet email already exist"
                });
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
            return res.status(500).json({
                message: error.message
            })
        })
}

exports.loginOutlet = function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    outlets.findOne({
        email: email
    })
        .then(function (outletData) {
            if (!outletData) {
                return res.status(404).json({
                    message: "outlet doesn't exist"
                });
            }
            return outletData;
        })
        .then(function (outletData) {
            return bcrypt.compare(password, outletData.password);
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
                message:"outlet logged in successfully",
                token:jwtToken
            });
        })
        .catch(function (error) {
            return res.status(500).json({
                message:error.message
            });
        })
}