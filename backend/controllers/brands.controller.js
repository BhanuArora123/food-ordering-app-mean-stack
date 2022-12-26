var brands = require("../models/brands.model");
var users = require("../models/users.model");

var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");
var outletsModel = require("../models/outlets.model");

var addTaskToQueue = require("../utils/aws/sqs/utils").addTaskToQueue;

var brandUtils = require("../utils/brands.utils");

var redisUtils = require("../utils/redis/redis.utils");

require("dotenv").config("./.env");

var utils = require("../utils/utils");

var orderModel = require("../models/order.model");

var objectId = require("mongoose").Types.ObjectId;

exports.getAllBrands = function (req, res, next) {
    try {
        var role = req.user.role;

        var permissions = req.user.permissions;

        var search = req.query.search;

        var limit = parseInt(req.query.limit);

        var page = parseInt(req.query.page);

        var skip = (page - 1) * limit;

        // var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
        //     name:"brand"
        // },"Manage Brands")

        // if (!isUserAuthorized) {
        //     return res.status(401).json({
        //         message: "Access Denied!"
        //     })
        // }
        // search filter 
        var matchQuery = {};

        if (search) {
            matchQuery["name"] = {
                $regex: search,
                $options: "i"
            }
        }

        var totalBrands;
        brands
            .countDocuments(matchQuery)
            .then(function (availableBrandsCount) {
                totalBrands = availableBrandsCount;
                return users
                    .aggregate([
                        {
                            $match: {
                                "role.name": "brand",
                                "role.subRoles": {
                                    $elemMatch: {
                                        $eq: "admin"
                                    }
                                },
                                // "brands.brandName": {
                                //     $elemMatch: {
                                //         $eq: (matchQuery.name || "")
                                //     }
                                // }
                            }
                        },
                        {
                            $unwind: "$brands"
                        },
                        {
                            $sort: {
                                createdAt: 1
                            }
                        },
                        {
                            $group: {
                                _id: "$brands.id",
                                brandData: {
                                    $first: "$brands"
                                },
                                email: {
                                    $first: "$email"
                                },
                                role: {
                                    $first: "$role"
                                },
                                permissions: {
                                    $first: "$permissions"
                                }
                            }
                        }
                    ])
                    .skip(skip)
                    .limit(limit)
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

exports.editOutlet = function (req, res, next) {
    try {
        var role = req.user.role;
        var permissions = req.user.permissions;
        var brandId = req.user.userId;
        var outletId = req.body.outletId;
        var name = req.body.name;
        var email = req.body.email;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "outlet"
        }, "Manage Brands");
        if (!isUserAuthorized) {
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

        brands.updateOne({
            _id: brandId
        }, {
            $set: dataToUpdate
        })
            .then(function () {
                redisUtils.deleteValue(`brand-${brandId}`);
                // update all brands with brand Name 
                // update in order and outlet collections 
                if (name) {
                    outletsModel.updateMany({
                        "brand.id": objectId(brandId)
                    }, {
                        $set: {
                            "brand.name": name
                        }
                    })
                    orderModel.updateMany({
                        "brand.id": objectId(brandId)
                    }, {
                        $set: {
                            "brand.name": name
                        }
                    })
                }
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

exports.getBrandUsers = function (req,res,next) {
    try {
        var brandId = req.query.brandId;
        var userId = req.user.userId;
        var page = parseInt(req.query.page || 1);
        var limit = parseInt(req.query.limit || 9);
        var skip = (page - 1)*limit;
        var brandUsersCount;

        var query = {
            "role.name":"brand",
            brands:{
                $elemMatch:{
                    id:brandId
                }
            },
            _id:{
                $ne:userId
            }
        };
        users
        .countDocuments(query)
        .then(function (totalBrandUsers) {
            brandUsersCount = totalBrandUsers;
            return users
            .find(query)
            .skip(skip)
            .limit(limit)
        })
        .then(function (brandUsers) {
            return res.status(200).json({
                message:"brands users fetched successfully",
                brandUsers:brandUsers,
                brandUsersCount:brandUsersCount
            })
        })
    } catch (error) {
        console.log(error);
    }
}