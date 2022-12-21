var admin = require("../models/admin.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");

var brandsModel = require("../models/brands.model");

var utils = require("../utils/utils");

var addTaskToQueue = require("../utils/aws/sqs/utils").addTaskToQueue;

var redisUtils = require("../utils/redis/redis.utils");

require("dotenv").config("./.env");

exports.registerAdmin = function (req, res, next) {
    try {
        if (req.user.role !== "superAdmin") {
            throwError("Access Denied!", 403);
        }
        var name = req.body.name;
        var email = req.body.email;
        var password = utils.genRandomPassword() || req.body.password;
        var permissions = req.body.permissions;
        var role = req.body.role;

        var emailContent = `Hi ${name} , Your Brand Registration is successful, please use below creds to access the portal!
            Email:${email}
            Password:${password}
        `;
        admin.findOne({
            email: email
        })
            .then(function (adminData) {
                if (adminData) {
                    throwError("admin email already exist", 403);
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
                    role: role,
                    permissions: permissions,
                    secretKey: process.env.AUTH_SECRET
                });
                return newAdmin.save();
            })
            .then(function (adminData) {
                // send email to brand 
                addTaskToQueue("SEND_EMAIL", {
                    MessageBody: {
                        email: email,
                        subject: 'Admin Registration Success!',
                        content: emailContent
                    }
                });
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
                    throwError("admin doesn't exist", 404);
                }
                adminDetails = adminData;
                return adminData;
            })
            .then(function (adminData) {
                return bcrypt.compare(password, adminData.password);
            })
            .then(function (result) {
                if (!result) {
                    throwError("incorrect password", 401);
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
                    adminData: adminDetails
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
        var adminId = req.user.userId;
        var currentPassword = req.body.currentPassword;
        var newPassword = req.body.newPassword;
        var role = req.user.role;

        if (role !== 'superAdmin') {
            return res.status(403).json({
                message: "Access Denied!"
            })
        }

        admin.findOne({
            _id: adminId
        })
            .then(function (adminData) {
                if (!adminData) {
                    throwError("admin doesn't exist", 404);
                }
                return utils.updatePassword(currentPassword, newPassword, adminData.password, adminId, role);
            })
            .then(function () {
                return res.status(200).json({
                    message: "admin password updated successfully"
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

exports.getAllBrands = function (req, res, next) {
    try {
        var role = req.user.role;

        var search = req.query.search;

        var limit = parseInt(req.query.limit);

        var page = parseInt(req.query.page);

        var skip = (page - 1) * limit;

        var isAdminAuthorized = req.user.permissions.find(function (permission) {
            return permission.permissionName === 'Manage Brand'
        })

        if (!isAdminAuthorized || (role !== 'superAdmin' && role !== 'admin')) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        // search filter 
        var matchQuery = {};

        if(search){
            matchQuery["name"] = {
                $regex:search,
                $options:"i"
            }
        }

        var totalBrands;
        brandsModel
            .countDocuments(matchQuery)
            .then(function (availableBrands) {
                totalBrands = availableBrands;
                return brandsModel
                    .find(matchQuery)
                    .skip(skip)
                    .limit(limit)
                    .sort({
                        name: 1
                    })
            })
            .then(function (brands) {
                return res.status(200).json({
                    message: "brands fetched successfully",
                    brands: brands,
                    totalBrands: totalBrands
                })
            })
            .catch(function (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            })

    } catch (error) {
        var statusCode = 500;
        return res.status(statusCode).json({
            message: error.message
        })
    }
}

exports.getAdminData = function (req, res, next) {
    try {
        var adminId = req.user.userId;

        if (req.user.role !== "superAdmin" && req.user.role !== 'admin') {
            throwError("Access Denied!", 403);
        }

        redisUtils
            .getValue(`admin-${adminId}`)
            .then(function (data) {
                if (!data) {
                    return admin.findOne({
                        _id: adminId
                    })
                }
                req.isRedisResponse = true;
                return JSON.parse(data);
            })
            .then(function (adminData) {
                if (!adminData) {
                    throwError("admin doesn't exist", 404);
                }
                if (!req.isRedisResponse) {
                    redisUtils.setValue(`admin-${adminData._id}`, JSON.stringify(adminData._doc));
                }
                return res.status(200).json({
                    message: "success",
                    adminData: adminData
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

exports.editBrand = function (req, res, next) {
    try {
        if (req.user.role !== "superAdmin") {
            throwError("Access Denied!", 403);
        }

        var brandId = req.body.brandId;
        var isDisabled = req.body.isDisabled;
        var name = req.body.name;
        var email = req.body.email;

        var dataToUpdate = {};

        if (name) {
            dataToUpdate["name"] = name;
        }
        if (email) {
            dataToUpdate["email"] = email;
        }
        if (isDisabled !== undefined) {
            dataToUpdate["isDisabled"] = isDisabled;
        }

        brandsModel.updateOne({
            _id: brandId
        }, {
            $set: dataToUpdate
        })
            .then(function () {
                return res.status(200).json({
                    message: "brand data updated successfully"
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

// permissions based auth 

exports.getPermissions = function (req, res, next) {
    try {
        var userId = req.user.userId;
        var role = req.user.role;

        var adminId = req.query.adminId;

        var adminPermissions = req.user.permissions;

        var isAdminAuthorized = adminPermissions.find(function (permission) {
            return permission.permissionName === 'Manage Admin'
        })

        if (userId.toString() !== adminId.toString() && !isAdminAuthorized && role !== 'superAdmin') {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        admin.findOne({
            _id: userId
        })
            .then(function (adminData) {
                if (!adminData) {
                    throwError("admin doesn't exist", 404);
                }
                return res.status(200).json({
                    permissions: adminData.permissions
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

exports.editPermissions = function (req, res, next) {
    try {
        var permissions = req.body.permissions;
        var adminId = req.body.adminId;
        var adminPermissions = req.user.permissions;

        // check if admin has permissions 
        var isAdminAuthorized = adminPermissions.find(function (permission) {
            return permission.permissionName === 'Manage Admin';
        })
        if (!isAdminAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        admin.updateOne({
            _id: adminId
        }, {
            $set: {
                permissions: permissions
            }
        })
            .then(function (data) {
                console.log(data);
                return res.status(200).json({
                    message: "admin permission updated successfully"
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
        var adminId = req.user.userId;
        var role = req.user.role;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var totalAdmins;

        var adminPermissions = req.user.permissions;
        var isAdminAuthorized = adminPermissions.find(function (permission) {
            return permission.permissionName === 'Manage Admin';
        })

        if (!isAdminAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            });
        }
        var rolesToFetch = (role === "superAdmin") ? [] : ["superAdmin"];
        admin.countDocuments({
            _id: {
                $ne: adminId
            },
            role: {
                $nin: rolesToFetch
            }
        })
            .then(function (availableAdmins) {
                totalAdmins = availableAdmins;
                return admin.find({
                    _id: {
                        $ne: adminId
                    },
                    role: {
                        $nin: rolesToFetch
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