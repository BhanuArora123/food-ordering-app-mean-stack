var brands = require("../models/brands.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");
var outletsModel = require("../models/outlets.model");

var addTaskToQueue = require("../utils/aws/sqs/utils").addTaskToQueue;

var brandUtils = require("../utils/brands.utils");

var redisUtils = require("../utils/redis/redis.utils");

require("dotenv").config("./.env");

var utils = require("../utils/utils");

exports.registerBrand = function (req, res, next) {
    try {
        var name = req.body.name;
        var email = req.body.email;
        var password = utils.genRandomPassword() || req.body.password;

        var emailContent = `Hi ${name} , Your Brand Registration is successful, please use below creds to access the portal!
            Email:${email}
            Password:${password}
        `;

        if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        brands.findOne({
            email: email
        })
            .then(function (brandData) {
                if (brandData) {
                    throwError("brand email already exist", 403);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(password, salt);
            })
            .then(function (hashedPassword) {
                var newBrand = new brands({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    secretKey: process.env.AUTH_SECRET
                });
                return newBrand.save();
            })
            .then(function (brandData) {
                // send email to brand 
                addTaskToQueue("SEND_EMAIL", {
                    MessageBody: {
                        email: email,
                        subject: 'Brand Registration Success!',
                        content: emailContent
                    }
                });
                return res.status(201).json({
                    message: "brand registered successfully",
                    brandData: brandData
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

exports.loginBrand = function (req, res, next) {
    try {
        var email = req.body.email;
        var password = req.body.password;
        var brandDetails;
        brands.findOne({
            email: email,
        })
            .then(function (brandData) {
                if (!brandData || brandData.isDisabled) {
                    throwError(brandData ? "brand is disabled by admin" : "brand doesn't exist", brandData ? 400 : 404);
                }
                brandDetails = brandData;
                return brandData;
            })
            .then(function (brandData) {
                return bcrypt.compare(password, brandData.password);
            })
            .then(function (result) {
                if (!result) {
                    throwError("unauthorised!", 401);
                }
                return jwt.sign({
                    email: email
                }, process.env.AUTH_SECRET, {
                    expiresIn: "15h"
                })
            })
            .then(function (jwtToken) {
                return res.status(200).json({
                    message: "brand logged in successfully",
                    token: jwtToken,
                    brandData: brandDetails
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

exports.getBrandData = function (req, res, next) {
    try {
        var brandId = req.user.userId;

        redisUtils
            .getValue(`brand-${brandId}`)
            .then(function (brandData) {
                if (!brandData) {
                    return brands.findOne({
                        _id: brandId
                    })
                }
                req.isRedisResponse = true;
                return JSON.parse(brandData);
            })
            .then(function (brandData) {
                if (!brandData) {
                    throwError("brand doesn't exist", 404);
                }
                if (!req.isRedisResponse) {
                    redisUtils.setValue(`brand-${brandId}`, JSON.stringify(brandData._doc));
                }
                return res.status(200).json({
                    message: "success",
                    brandData: brandData
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

exports.editOutlet = function (req, res, next) {
    try {
        var role = req.user.role;
        var brandId = req.user.userId;
        var outletId = req.body.outletId;
        var name = req.body.name;
        var email = req.body.email;

        if (role !== "superAdmin" && role !== "brand") {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var dataToUpdate = {};

        if (name) {
            dataToUpdate["name"] = name;
        }
        if (email) {
            dataToUpdate["email"] = email;
        }

        outletsModel.updateOne({
            _id: outletId,
            "brand.id": brandId
        }, {
            $set: dataToUpdate
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                if (name) {
                    return foodModel.updateMany({
                        "outlet.id": outletId
                    }, {
                        $set: {
                            "outlet.name": outletData.name
                        }
                    })
                }
            })
            .then(function () {
                return res.status(200).json({
                    message: "outlet updated successfully"
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

exports.removeOutlet = function (req, res, next) {
    try {
        var outletId = req.body.outletId;
        var brandId = req.user.brandId;

        outletsModel.updateOne({
            _id: outletId,
            "brand.id": brandId
        }, {
            $set: {
                isDeleted: true
            }
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist! or brand is not authorized to delete this outlet", 404);
                }
                return res.status(200)
            })
    } catch (error) {

    }
}

exports.getAllOutlets = function (req, res, next) {
    try {
        var brandId = req.query.brandId || req.user.userId;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var search = req.query.search;
        var totalOutlets;
        var matchQuery = {
            "brand.id": brandId
        };
        // adding search filter 
        if(search){
            matchQuery["name"] = {
                $regex:search,
                $options:"i"
            }
        }

        if (req.user.role !== 'brand' && req.user.role !== 'superAdmin') {
            return res.status(403).json({
                message: "Access Denied!"
            })
        }

        outletsModel
            .countDocuments(matchQuery)
            .then(function (availableOutlets) {
                totalOutlets = availableOutlets;
                return outletsModel.find(
                    matchQuery,
                    {
                        name: 1,
                        email: 1,
                        tables: 1,
                        _id: 1,
                        permissions: 1
                    })
                    .skip(skip)
                    .limit(limit)
                    .sort({
                        createdAt: 1
                    })
            })
            .then(function (outlets) {
                return res.status(200).json({
                    message: "outlets fetched successfully",
                    outlets: outlets,
                    totalOutlets: totalOutlets
                })
            })
            .catch(function (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
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

exports.updatePassword = function (req, res, next) {
    try {
        var brandId = req.user.userId || req.body.brandId;
        var currentPassword = req.body.currentPassword;
        var newPassword = req.body.newPassword;

        if (req.user.role !== 'brand' && req.user.role !== 'superAdmin') {
            return res.status(403).json({
                message: "Access Denied!"
            })
        }

        brands.findOne({
            _id: brandId
        })
            .then(function (brandData) {
                if (!brandData) {
                    throwError("brand doesn't exist", 404);
                }
                return bcrypt.compare(currentPassword, brandData.password)
            })
            .then(function (isPasswordCorrect) {
                if (!isPasswordCorrect) {
                    return res.status(403).json({
                        message: "incorrect password!"
                    })
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(newPassword, salt);
            })
            .then(function (hashedPassword) {
                return brands.updateOne({
                    _id: brandId
                }, {
                    $set: {
                        password: hashedPassword
                    }
                });
            })
            .then(function () {
                return res.status(200).json({
                    message: "brand password updated successfully"
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

        var brandId = req.query.brandId;
        var adminPermissions = req.user.permissions;

        // check if admin has permissions 
        var isAdminAuthorized = adminPermissions.find(function (permission) {
            return permission.permissionName === 'Manage Brand';
        })
        if (userId.toString() !== brandId.toString() && !isAdminAuthorized && role !== 'superAdmin') {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        brands.findOne({
            _id: brandId
        })
            .then(function (brandData) {
                if (!brandData) {
                    throwError("brand doesn't exist", 404);
                }
                return res.status(200).json({
                    permissions: brandData.permissions
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
        var brandId = req.body.brandId;
        var role = req.user.role;
        var adminPermissions = req.user.permissions;

        // check if admin has permissions 
        var isAdminAuthorized = adminPermissions.find(function (permission) {
            return permission.permissionName === 'Manage Brand';
        })
        if (role !== 'superAdmin' && !isAdminAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        brands.updateOne({
            _id: brandId
        }, {
            $set: {
                permissions: permissions
            }
        })
            .then(function () {
                return res.status(200).json({
                    message: "brand permission updated successfully"
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

exports.sendInstructionsToOutlet = function (req, res, next) {
    try {
        var title = req.body.title;
        var content = req.body.content;
        var brandId = req.user.userId;
        var role = req.user.role;

        // brand authorization
        var isBrandAuthorized = req.user.permissions.find(function (permission) {
            return permission.permissionId === 2;
        })

        if (!isBrandAuthorized || role !== 'brand') {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        brandUtils
            .changeNotificationForOutlets(title, content, brandId)
            .then(function () {
                return res.status(200).json({
                    message: "outlets Notified successfully!"
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