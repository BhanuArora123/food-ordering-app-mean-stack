var outlets = require("../models/outlets.model");

var orders = require("../models/order.model");

var throwError = require("../utils/errors");

var users = require("../models/users.model");

var utils = require("../utils/utils");

var async = require("async");

var ObjectId = require("mongoose").Types.ObjectId;

require("dotenv").config("./.env");

exports.getTables = function (req, res, next) {
    try {

        var role = req.user.role;
        var permissions = req.user.permissions;

        var isAssigned = req.query.isAssigned;
        var page = req.query.page ? parseInt(req.query.page) : 1;
        var limit = req.query.limit ? parseInt(req.query.limit) : 9;

        var skip = (page - 1) * limit;

        var totalTables;

        var outletId = req.query.outletId;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Tables");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
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
        var tableId = req.body.tableId;
        var assignedOrderId = req.body.assignedOrderId;
        var outletId = req.body.outletId || req.user.userId;


        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Tables");

        if (!isUserAuthorized) {
            return res.status(401).json({
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
                outletData.tables.push({
                    tableId: tableId,
                    assignedOrderId: assignedOrderId
                })
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
        var brandId = req.body.brandId;
        var outletId = req.body.outletId;
        var name = req.body.name;
        var isDisabled = req.body.isDisabled;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Outlets");
        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        async.parallel([
            function (cb) {
                outlets.updateOne({
                    _id: outletId,
                    "brand.id": brandId
                }, {
                    $set: {
                        name: name,
                        isDeleted: (isDisabled ? true : false)
                    }
                }, function (error, outletData) {
                    if (error) {
                        cb(error);
                    }
                    if (!outletData) {
                        return cb(new Error("outlet doesn't exist", {
                            cause: {
                                statusCode: 404
                            }
                        }));
                    }
                    return cb(null);
                })
            },
            function (cb) {
                return users.updateMany({
                    outlets: {
                        $elemMatch: {
                            id: ObjectId(outletId)
                        }
                    }
                }, {
                    "outlets.$[outlet].isDeleted": (!isDisabled) ? false : true,
                    "outlets.$[outlet].name": name
                }, {
                    arrayFilters: [
                        {
                            "outlet.id": ObjectId(outletId)
                        }
                    ]
                }, function (err) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null);
                })
            },
            function (cb) {
                if (name) {
                    orders.updateMany({
                        "outlet.id": outletId
                    }, {
                        $set: {
                            "outlet.name": name
                        }
                    }, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null);
                    })
                }
            }
        ], function (error, results) {
            if (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "outlet updated successfully"
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
        var role = req.user.role;
        var permissions = req.user.permissions;
        var brandId = req.query.brandId;
        var search = req.query.search;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "brand"
        }, "Manage Outlets");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
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

        async.parallel([
            function (cb) {
                return outlets.countDocuments(matchQuery)
                    .then(function (availableOutlets) {
                        cb(null, availableOutlets)
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                return outlets.find(matchQuery, {
                    admin: 1,
                    name: 1,
                    brand: 1,
                    isDeleted: 1
                })
                    .skip(skip)
                    .limit(limit)
                    .then(function (outlets) {
                        cb(null, outlets)
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error, outletsData) {
            if (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "outlets fetched successfully",
                outlets: outletsData[1],
                totalOutlets: outletsData[0]
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
        var outletId = req.query.outletId;
        var brandId = req.query.brandId;
        var userId = req.user.userId;
        var userSubRole = req.query.subRole;
        var page = parseInt(req.query.page || 1);
        var limit = parseInt(req.query.limit || 9);
        var skip = (page - 1) * limit;
        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Outlets");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var query = {
            _id: {
                $ne: userId
            },
            "role.name": "outlet",
            outlets: {
                $elemMatch: {
                    "brand.id": brandId
                }
            }
        };

        if (outletId) {
            query["outlets"] = {
                $elemMatch: {
                    id: outletId,
                    "brand.id": brandId
                }
            }
        }

        if (userSubRole) {
            query["role.subRoles"] = {
                $elemMatch: {
                    $eq: userSubRole
                }
            }
        }
        async.parallel([
            function (cb) {
                return users
                    .countDocuments(query)
                    .then(function (totalOutletUsers) {
                        cb(null, totalOutletUsers);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                return users
                    .find(query, {
                        brands: 1,
                        email: 1,
                        name: 1,
                        outlets: 1,
                        permissions: 1,
                        role: 1
                    })
                    .skip(skip)
                    .limit(limit)
                    .then(function (outletUsers) {
                        cb(null, outletUsers);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error, outletUsersData) {
            if (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "outlets users fetched successfully",
                outletUsers: outletUsersData[1],
                outletUsersCount: outletUsersData[0]
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}