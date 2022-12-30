var outlets = require("../models/outlets.model");

var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");

var users = require("../models/users.model");

var utils = require("../utils/utils");

var redisUtils = require("../utils/redis/redis.utils");

require("dotenv").config("./.env");

exports.getTables = function (req, res, next) {
    try {

        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"outlet"
        },"Manage Tables");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

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
        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"outlet"
        },"Manage Tables");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

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

exports.editOutlet = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;
        var brandId = req.user.userId;
        var outletId = req.body.outletId;
        var name = req.body.name;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Outlets");
        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var dataToUpdate = {};

        if (name) {
            dataToUpdate["name"] = name;
        }

        outlets.updateOne({
            _id: outletId,
            "brand.id": brandId
        }, {
            $set: dataToUpdate
        })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist", 404);
                }
                // reset redis cache 
                redisUtils.deleteValue();
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

exports.removeOutlet = function (req,res,next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;
        var outletId = req.query.outletId;
        var brandId = req.query.brandId;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Outlets");
        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        outlets.updateOne({
            _id:outletId,
            "brand.id":brandId
        },{
            $set:{
                isDeleted:true
            }
        })
        .then(function () {
            return res.status(200).json({
                message:"outlet deleted successfully"
            })
        })

    } catch (error) {
        
    }
}

exports.getAllOutlets = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"brand"
        },"Manage Outlets");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var brandId = req.query.brandId || req.user.userId;
        var search = req.query.search;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
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
                return outlets
                    .find(matchQuery)
                    .skip(skip)
                    .limit(limit)
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
        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"outlet"
        },"Manage Outlets");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var outletId = req.query.outletId;
        var brandId = req.query.brandId;
        var userId = req.user.userId;
        var userSubRole = req.query.subRole;
        var page = parseInt(req.query.page || 1);
        var limit = parseInt(req.query.limit || 9);
        var skip = (page - 1) * limit;
        var outletUsersCount;

        var query = {
            "role.name": "outlet",
            _id: {
                $ne: userId
            },
            outlets:{
                $elemMatch:{
                    "brand.id":brandId
                }
            }
        };

        if(outletId){
            query["outlets"] = {
                $elemMatch:{
                    id:outletId,
                    "brand.id":brandId
                }
            }
        }

        if(userSubRole){
            query["role.subRoles"] = {
                $elemMatch:{
                    $eq:userSubRole
                }
            }
        }
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