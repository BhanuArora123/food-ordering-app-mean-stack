var users = require("../models/users.model");

var brands = require("../models/brands.model");

var outlets = require("../models/outlets.model");

var throwError = require("../utils/errors");

var config = require("../config/config");

var bcrypt = require("bcryptjs");

var async = require("async");

var utils = require("../utils/utils");

var addTaskToQueue = require("../utils/aws/sqs/utils").addTaskToQueue;

var jwt = require("jsonwebtoken");

var redisUtils = require("../utils/redis/redis.utils");

var ObjectId = require("mongoose").Types.ObjectId;

exports.registerUser = function (req, res, next) {
    try {
        var createrRole = req.user.role;
        var createrPermissions = req.user.permissions;
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password || utils.genRandomPassword();
        var brand = req.body.brand;
        var outlet = req.body.outlet;
        var role = req.body.role;
        var permissions = req.body.permissions;
        var brandAuthorization = utils.isUserAuthorized(createrRole, createrPermissions, role, "Manage Outlets");
        var adminAuthorization = utils.isUserAuthorized(createrRole, createrPermissions, role, "Manage Brands");
        var encryptedPassword;

        if (!brandAuthorization && !adminAuthorization && createrRole.name !== "superAdmin") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

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
                if (role.name !== "outlet" && role.name !== "brand") {
                    return;
                }
                return utils.registerBrandOrOutlet(role.name, brand, outlet, name, email);
            })
            .then(function (registeredEntity) {
                var newUser = new users({
                    name: name,
                    email: email,
                    password: encryptedPassword,
                    role: role,
                    permissions: permissions,
                    brands: (role.name === "brand" ? [registeredEntity] : undefined),
                    outlets: (role.name === "outlet" ? [registeredEntity] : undefined),
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
                    message: "user registered successfully! Please Check Your inbox for creds",
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
                if (!userData || !utils.blockDisabledBrands(userData)) {
                    throwError(userData ? "none of your brands is enabled" : "user doesn't exist", userData ? 403 : 404);
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
                }, config.authSecret, {
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
                    }, {
                        name: 1,
                        email: 1,
                        role: 1,
                        permissions: 1,
                        outlets: 1,
                        brands: 1
                    });
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

exports.getAllAdmins = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var role = req.user.role;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var userPermissions = req.user.permissions;
        var isUserAuthorized = utils.isUserAuthorized(role, userPermissions, {
            name: "admin"
        }, "Manage Admin");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            });
        }
        var rolesToFetch = (role === "superAdmin") ? ["admin"] : ["superAdmin", "admin"];
        async.parallel([
            function (cb) {
                return users.countDocuments({
                    _id: {
                        $ne: userId
                    },
                    "role.name": {
                        $in: rolesToFetch
                    }
                })
                    .then(function (availableAdmins) {
                        cb(null, availableAdmins);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                return users.find({
                    _id: {
                        $ne: userId
                    },
                    "role.name": {
                        $in: rolesToFetch
                    }
                }, {
                    name: 1,
                    email: 1,
                    permissions: 1,
                    role: 1,
                    _id: 0
                })
                    .skip(skip)
                    .limit(limit)
                    .then(function (admins) {
                        cb(null,admins);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ],function (error,adminsData) {
            if(error){
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "admins fetched successfully",
                admins: adminsData[1],
                totalAdmins: adminsData[0]
            });
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
                "role.name": {
                    $in: ["admin", "superAdmin"]
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

exports.editUser = function (req, res, next) {
    try {
        // authorization 
        var editUserRole = req.user.role;
        var editUserPermissions = req.user.permissions;
        var brandsToAllot = req.body.brandsToAllot;
        var outletsToAllot = req.body.outletsToAllot;
        var userId = req.body.userId;
        var userEmail = req.body.userEmail;
        var userName = req.body.userName;
        var userRole = req.body.role;
        var userPermissions = req.body.permissions;

        var isBrandAuthorized = utils.isUserAuthorized(editUserRole, editUserPermissions, {
            name: "brand"
        }, 'Manage Brand Users');

        var isOutletAuthorized = utils.isUserAuthorized(editUserRole, editUserPermissions, {
            name: "outlet"
        }, "Manage Outlet Users");

        var isAdminAuthorized = utils.isUserAuthorized(editUserRole, editUserPermissions, {
            name: "admin"
        }, "Manage Brands");

        if ((brandsToAllot && !isBrandAuthorized && !isAdminAuthorized) || (outletsToAllot && !isOutletAuthorized)) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        users.findOne({
            _id: userId
        })
            .then(function (userData) {
                if (!userData) {
                    throwError("user doesn't exists", 404);
                }
                if (brandsToAllot) {
                    userData.brands = brandsToAllot;
                }
                if (outletsToAllot) {
                    userData.outlets = outletsToAllot;
                }
                userData.email = userEmail;
                userData.name = userName;
                userData.role = userRole;
                userData.permissions = userPermissions;
                console.log(userData);
                return userData.save();
            })
            .then(function (userData) {
                redisUtils.deleteValue(userId);
                if (userData.role.subRoles.includes("admin") && (brandsToAllot || outletsToAllot)) {
                    var entityToUpdate = brandsToAllot || outletsToAllot;
                    var modelToUpdate = brandsToAllot ? brands : outlets;
                    var entityIds = entityToUpdate.map(function (entity) {
                        return ObjectId(entity.id);
                    })
                    return modelToUpdate.updateMany({
                        _id: {
                            $in: entityIds
                        }
                    }, {
                        $set: {
                            admin: {
                                name: userName,
                                email: userEmail
                            }
                        }
                    })
                }
            })
            .then(function () {
                return res.status(200).json({
                    message: "brands/outlets alloted successfully!"
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