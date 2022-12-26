var users = require("../models/users.model");

var throwError = require("../utils/errors");

require("dotenv").config("../.env");

var bcrypt = require("bcryptjs");

var utils = require("../utils/utils");

var addTaskToQueue = require("../utils/aws/sqs/utils").addTaskToQueue;

var jwt = require("jsonwebtoken");

var redisUtils = require("../utils/redis/redis.utils");
var brandsModel = require("../models/brands.model");

exports.registerUser = function (req, res, next) {
    try {
        // if (req.user.role !== "superAdmin") {
        //     throwError("Access Denied!", 403);
        // }
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password || utils.genRandomPassword();
        var permissions = req.body.permissions;
        var role = req.body.role;
        var brand = req.body.brand;
        var outlet = req.body.outlet;
        var encryptedPassword;

        var emailContent = `Hi ${name} , Your ${role.name} Registration is successful, please use below creds to access the portal!
            Email:${email}
            Password:${password}
        `;
        users
            .findOne({
                email: email
            })
            .then(function (userData) {
                if (userData) {
                    throwError("user email already exist", 403);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(password, salt);
            })
            .then(function (hashedPassword) {
                encryptedPassword = hashedPassword;
                if(role.name !== "outlet" && role.name !== "brand"){
                    return ;
                }
                return utils.registerBrandOrOutlet(role.name,brand,outlet);
            })
            .then(function (registeredEntity) {
                var newUser = new users({
                    name: name,
                    email: email,
                    password: encryptedPassword,
                    role: role,
                    permissions: permissions,
                    brands:(role.name === "brand"?[registeredEntity]:undefined),
                    outlets:(role.name === "outlet"?[registeredEntity]:undefined),
                });
                return newUser.save();
            })
            .then(function (userData) {
                // send email to brand 
                addTaskToQueue("SEND_EMAIL", {
                    MessageBody: {
                        email: email,
                        subject: `${userData.role.name} Registration Success!`,
                        content: emailContent
                    }
                });
                return res.status(201).json({
                    message: "user registered successfully",
                    userData: userData
                })
            })
            .catch(function (error) {
                console.log(error);
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

exports.loginUser = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;
        var userDetails;
        users.findOne({
            email: email
        })
            .then(function (userData) {
                if (!userData) {
                    throwError("user doesn't exist", 404);
                }
                userDetails = userData;
                return bcrypt.compare(password, userData.password);
            })
            .then(function (result) {
                if (!result) {
                    throwError("incorrect password", 401);
                }
                return jwt.sign({
                    email: email,
                    role: userDetails.role.name,
                    userId: userDetails._id
                }, process.env.AUTH_SECRET, {
                    expiresIn: "15h"
                })
            })
            .then(function (jwtToken) {
                return res.status(200).json({
                    message: `${userDetails.role.name} logged in successfully`,
                    token: jwtToken,
                    userData: userDetails
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

exports.updatePassword = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var currentUserId = req.body.userId;
        var currentPassword = req.body.currentPassword;
        var newPassword = req.body.newPassword;

        if (userId.toString() !== currentUserId) {
            return res.status(403).json({
                message: "Access Denied!"
            })
        }

        users.findOne({
            _id: userId
        })
            .then(function (userData) {
                if (!userData) {
                    throwError("admin doesn't exist", 404);
                }
                return utils.updatePassword(currentPassword, newPassword, userData.password, userId);
            })
            .then(function () {
                return res.status(200).json({
                    message: "password updated successfully"
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

exports.getUserData = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var currentUserId = req.query.userId;

        if (userId.toString() !== currentUserId) {
            throwError("Access Denied!", 403);
        }

        redisUtils
            .getValue(currentUserId)
            .then(function (data) {
                if (!data) {
                    return users.findOne({
                        _id: userId
                    })
                }
                req.isRedisResponse = true;
                return JSON.parse(data);
            })
            .then(function (userData) {
                if (!userData) {
                    throwError("user doesn't exist", 404);
                }
                if (!req.isRedisResponse) {
                    redisUtils.setValue(currentUserId, JSON.stringify(userData._doc));
                }
                return res.status(200).json({
                    message: "success",
                    userData: userData
                });
            })
            .catch(function (error) {
                console.log(error);
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

exports.editPermissions = function (req, res, next) {
    try {
        var permissions = req.body.permissions;
        var role = req.body.role;
        var userId = req.body.userId;
        var currentUserRole = req.body.currentUserRole;
        var userPermissions = req.user.permissions;

        // check if user has permissions
        var isUserAuthorized = utils.isUserAuthorized(role,userPermissions,currentUserRole,"Manage Users"); 
        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        
        users.updateOne({
            _id: userId
        }, {
            $set: {
                permissions: permissions,
                role:role
            }
        })
            .then(function (data) {
                console.log(data);
                return res.status(200).json({
                    message: "user permission updated successfully"
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

exports.getAllAdmins = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var role = req.user.role;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var totalAdmins;

        var userPermissions = req.user.permissions;
        var isUserAuthorized = utils.isUserAuthorized(role,userPermissions,{
            name:"admin"
        },"Manage Users")

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            });
        }
        var rolesToFetch = (role === "superAdmin") ? ["admin"] : ["superAdmin","admin"];
        users.countDocuments({
            _id: {
                $ne: userId
            },
            "role.name": {
                $in: rolesToFetch
            }
        })
            .then(function (availableAdmins) {
                totalAdmins = availableAdmins;
                return users.find({
                    _id: {
                        $ne: userId
                    },
                    "role.name":{
                        $in:rolesToFetch
                    }
                })
                    .skip(skip)
                    .limit(limit)
            })

            .then(function (admins) {
                return res.status(200).json({
                    message: "admins fetched successfully",
                    admins: admins,
                    totalAdmins: totalAdmins
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
        })
    }
}

exports.getAdminCount = function (req, res, next) {
    try {
        users
            .countDocuments({
                "role.name":{
                    $in :["admin","superAdmin"]
                }
            })
            .then(function (adminCount) {
                return res.status(200).json({
                    totalAdmins: adminCount
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