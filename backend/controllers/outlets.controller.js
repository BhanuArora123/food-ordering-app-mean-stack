var outlets = require("../models/outlets.model");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var throwError = require("../utils/errors");
var addTaskToQueue = require("../utils/aws/sqs/utils").addTaskToQueue;
var brandsModel = require("../models/brands.model");

var redisUtils = require("../utils/redis/redis.utils");

var users = require("../models/users.model");

require("dotenv").config("./.env");

exports.getTables = function (req, res, next) {
    try {
        var isAssigned = req.query.isAssigned;
        var page = req.query.page ? parseInt(req.query.page) : 1;
        var limit = req.query.limit ? parseInt(req.query.limit) : 9;

        var skip = (page - 1) * limit;

        var totalTables;

        var outletId = req.query.outletId || req.user.userId;

        outlets
            .findOne({
                _id: outletId
            })
            .then(function (outletData) {
                totalTables = outletData.tables.length;
                return outlets.findOne({
                    _id: outletId
                },
                    {
                        tables: {
                            $slice: [skip, limit]
                        }
                    })
            })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }

                var tables = outletData.tables;

                if (isAssigned !== undefined) {
                    tables = tables.filter(function (table) {
                        return table.isAssigned.toString() === isAssigned;
                    })
                }

                return res.status(200).json({
                    message: "tables fetched successfully",
                    tables: tables,
                    totalTables: totalTables
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

exports.addTable = function (req, res, next) {
    try {
        var tableId = req.body.tableId;
        var assignedOrderId = req.body.assignedOrderId;

        var outletId = req.body.outletId || req.user.userId;

        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                outletData.tables.push({
                    tableId: tableId,
                    assignedOrderId: assignedOrderId
                })
                console.log(outletData.tables);
                return outletData.save();
            })
            .then(function (outletData) {
                return res.status(200).json({
                    message: "table added successfully",
                    tables: outletData.tables
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
        console.log(error);
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.updatePassword = function (req, res, next) {
    try {
        var outletId = req.user.userId || req.body.outletId;
        var currentPassword = req.body.currentPassword;
        var newPassword = req.body.newPassword;

        if (req.user.role.name !== 'outlet' && req.user.role.name !== 'brand') {
            return res.status(403).json({
                message: "Access Denied!"
            })
        }

        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                console.log(currentPassword, outletData.password)
                return bcrypt.compare(currentPassword, outletData.password)
            })
            .then(function (isPasswordCorrect) {
                console.log("password -", isPasswordCorrect);
                if (!isPasswordCorrect) {
                    throwError("incorrect current password", 401);
                }
                return bcrypt.genSalt(12);
            })
            .then(function (salt) {
                return bcrypt.hash(newPassword, salt);
            })
            .then(function (hashedPassword) {
                return outlets.updateOne({
                    _id: outletId
                }, {
                    $set: {
                        password: hashedPassword
                    }
                });
            })
            .then(function () {
                return res.status(200).json({
                    message: "password updated successfully!"
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

        var outletId = req.query.outletId;

        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                else if (outletId.toString !== userId.toString() && outletData.brand.id.toString() !== userId.toString() && role !== 'superAdmin') {
                    throwError("Access Denied!", 401);
                }
                return res.status(200).json({
                    permissions: outletData.permissions
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
        var outletId = req.body.outletId;
        var role = req.user.role;
        var userId = req.user.userId;

        outlets.findOne({
            _id: outletId
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                if (outletData.brand.id.toString() !== userId.toString() && role !== "superAdmin") {
                    throwError("Access Denied!", 401);
                }
                outletData.permissions = permissions;
                return outletData.save();
            })
            .then(function (outletData) {
                return res.status(200).json({
                    message: "outlet permissions updated successfully",
                    outletData: outletData
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
        if (search) {
            matchQuery["name"] = {
                $regex: search,
                $options: "i"
            }
        }

        if (req.user.role.name !== 'brand' && req.user.role.name !== 'superAdmin') {
            return res.status(403).json({
                message: "Access Denied!"
            })
        }

        outlets
            .countDocuments(matchQuery)
            .then(function (availableOutlets) {
                totalOutlets = availableOutlets;
                return users.aggregate([
                    {
                        $match: {
                            "role.name": "outlet",
                            "role.subRoles": {
                                $elemMatch: {
                                    $eq: "admin"
                                }
                            }
                        }
                    },
                    {
                        $sort: {
                            createdAt: 1
                        }
                    },
                    {
                        $unwind: "$outlets"
                    },
                    {
                        $group: {
                            _id: "$outlets.id",
                            name: {
                                $first: "$name"
                            },
                            email: {
                                $first: "$email"
                            },
                            outletData: {
                                $first: "$outlets"
                            },
                            role: {
                                $first: "$role"
                            },
                            permissions: {
                                $first: "$permissions"
                            }
                        }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    }
                ])
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

exports.getOutletUsers = function (req, res, next) {
    try {
        var outletId = req.query.outletId;
        var userId = req.user.userId;
        var page = parseInt(req.query.page || 1);
        var limit = parseInt(req.query.limit || 9);
        var skip = (page - 1) * limit;
        var outletUsersCount;

        var query = {
            "role.name": "outlet",
            outlets: {
                $elemMatch: {
                    id: outletId
                }
            },
            _id: {
                $ne: userId
            }
        };
        users
            .countDocuments(query)
            .then(function (totalOutletUsers) {
                outletUsersCount = totalOutletUsers;
                return users
                    .find(query)
                    .skip(skip)
                    .limit(limit)
            })
            .then(function (outletUsers) {
                return res.status(200).json({
                    message: "outlets users fetched successfully",
                    outletUsers: outletUsers,
                    outletUsersCount: outletUsersCount
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