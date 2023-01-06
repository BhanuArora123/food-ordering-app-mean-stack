var async = require("async");
// models
var brands = require("../models/brands.model");
var users = require("../models/users.model");
var outletsModel = require("../models/outlets.model");
var orderModel = require("../models/order.model");
// utils 
var brandUtils = require("../utils/brands.utils");
var redisUtils = require("../utils/redis/redis.utils");
var utils = require("../utils/utils");
var throwError = require("../utils/errors");
// data type 
var ObjectId = require("mongoose").Types.ObjectId;

exports.getAllBrands = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;

        var search = req.query.search;

        var limit = parseInt(req.query.limit);

        var page = parseInt(req.query.page);

        var skip = (page - 1) * limit;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "brand"
        }, "Manage Brands");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        // search filter
        var matchQuery = {};

        if (search) {
            matchQuery["name"] = {
                $regex: search,
                $options: "i"
            }
        }
        async.parallel([
            function (cb) {
                return brands
                    .countDocuments(matchQuery)
                    .then(function (availableBrandsCount) {
                        return cb(null, availableBrandsCount);
                    })
                    .catch(function (error) {
                        return cb(error);
                    })
            },
            function (cb) {
                return brands
                    .find(matchQuery, {
                        name: 1,
                        admin: 1,
                        isDisabled: 1
                    })
                    .skip(skip)
                    .limit(limit)
                    .then(function (brands) {
                        cb(null, brands);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error, brandData) {
            if (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "brands fetched successfully",
                brands: brandData[1],
                totalBrands: brandData[0]
            })
        })
    } catch (error) {
        var statusCode = 500;
        return res.status(statusCode).json({
            message: error.message
        })
    }
}

exports.editBrand = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;
        var brandId = req.body.brandId;
        var isDisabled = req.body.isDisabled;
        var name = req.body.name;
        // authorization
        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "brand"
        }, "Manage Brands");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            });
        }
        var dataToUpdate = {};
        if (name) {
            dataToUpdate["name"] = name;
        }
        if (isDisabled !== undefined) {
            dataToUpdate["isDisabled"] = isDisabled;
        }

        async.parallel([
            function (cb) {
                brands.updateOne({
                    _id: brandId
                }, {
                    $set: dataToUpdate
                })
                    .then(function (data) {
                        cb(null, data);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                redisUtils
                    .deleteValue(`brand-${brandId}`)
                    .then(function () {
                        cb(null);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            // update all brands with brand Name 
            // update in order and outlet collections 
            function (cb) {
                if (name) {
                    return outletsModel.updateMany({
                        "brand.id": ObjectId(brandId)
                    }, {
                        $set: {
                            "brand.name": name
                        }
                    })
                        .then(function (data) {
                            cb(null, data);
                        })
                        .catch(function (error) {
                            cb(error);
                        })
                }
                cb(null);
            },
            function (cb) {
                if (name) {
                    return orderModel.updateMany({
                        "brand.id": ObjectId(brandId)
                    }, {
                        $set: {
                            "brand.name": name
                        }
                    })
                        .then(function (data) {
                            cb(null, data);
                        })
                        .catch(function (error) {
                            cb(error);
                        })
                }
                cb(null);
            },
            function (cb) {
                if (isDisabled !== undefined) {
                    return users.updateMany({
                        brands: {
                            $elemMatch: {
                                id: ObjectId(brandId)
                            }
                        }
                    }, {
                        "brands.$[brand].isDisabled": isDisabled
                    }, {
                        arrayFilters: [
                            {
                                "brand.id": ObjectId(brandId)
                            }
                        ]
                    })
                        .then(function (data) {
                            cb(null, data);
                        })
                        .catch(function (error) {
                            cb(error);
                        })
                }
                cb(null);
            }
        ], function (error, results) {
            if (error) {
                console.log(error);
                return res.status(500).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "brand data updated successfully"
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getBrandUsers = function (req, res, next) {
    try {
        var brandId = req.query.brandId;
        var userId = req.user.userId;
        var userSubRole = req.query.subRole;
        var page = parseInt(req.query.page || 1);
        var limit = parseInt(req.query.limit || 9);
        var skip = (page - 1) * limit;
        var query = {
            _id: {
                $ne: userId
            },
            "role.name": "brand"
        };
        if (brandId) {
            query["brands"] = {
                $elemMatch: {
                    id: brandId
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
        console.log(query);
        async.parallel([
            function (cb) {
                users
                    .countDocuments(query)
                    .then(function (totalBrandUsers) {
                        return cb(null, totalBrandUsers);
                    })
                    .catch(function (error) {
                        return cb(error);
                    })
            },
            function (cb) {
                return users
                    .find(query, {
                        name: 1,
                        email: 1,
                        brands: 1,
                        permissions: 1,
                        outlets: 1,
                        role: 1
                    })
                    .skip(skip)
                    .limit(limit)
                    .then(function (brandUsers) {
                        cb(null, brandUsers);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ],
            function (error, brandUsersData) {
                if (error) {
                    console.log(error);
                    var statusCode = error.cause ? error.cause.statusCode : 500;
                    return res.status(statusCode).json({
                        message: error.message
                    })
                }
                return res.status(200).json({
                    message: "brands users fetched successfully",
                    brandUsers: brandUsersData[1],
                    brandUsersCount: brandUsersData[0]
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