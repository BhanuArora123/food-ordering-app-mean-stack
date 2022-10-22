var users = require("../models/users.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

require("dotenv").config("./.env");

exports.registerUser = function (req, res, next) {
    try {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        users.findOne({
            email: email
        })
            .then(function (userData) {
                if (userData) {
                    return res.status(403).json({
                        message: "user email already exist"
                    });
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(password, salt);
            })
            .then(function (hashedPassword) {
                var newUser = new users({
                    name: name,
                    email: email,
                    password: hashedPassword
                });
                return newUser.save();
            })
            .then(function (userData) {
                return res.status(201).json({
                    message: "user registered successfully",
                    userData: userData
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

exports.loginUser = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;

        users.findOne({
            email: email
        })
            .then(function (userData) {
                if (!userData) {
                    return res.status(404).json({
                        message: "user doesn't exist"
                    });
                }
                return userData;
            })
            .then(function (userData) {
                return bcrypt.compare(password, userData.password);
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
                    message: "user logged in successfully",
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

exports.getUserData = function (req, res, next) {
    try {
        var userId = req.user.userId;
        // console.log(req.user);
        users.findOne({
            _id: userId
        })
            .then(function (userData) {
                if (!userData) {
                    return res.status(404).json({
                        message: "user doesn't exist"
                    })
                }
                return res.status(200).json({
                    message: "user data fetched successfully",
                    userData: userData
                });
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