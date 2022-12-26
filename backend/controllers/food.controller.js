var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");

var ObjectId = require("mongoose").Types.ObjectId;

var async = require("async");

var s3Utils = require("../utils/aws/s3/utils");

var utils = require("../utils/utils");

var brandUtils = require("../utils/brands.utils");

exports.addFoodItem = function (req, res, next) {
    try {
        var foodName = req.body.foodName;
        var foodPrice = req.body.foodPrice;
        var foodDesc = req.body.foodDesc;
        var brand = JSON.parse(req.body.brand);
        var category = req.body.category;
        var subCategory = req.body.subCategory;
        var isVeg = req.body.isVeg;
        var taxes = JSON.parse(req.body.taxes);

        async.waterfall(utils.convertToArray({

            verifyRole: function (cb) {
                // checking the allowed role for creating food item
                if (req.user.role.name !== "admin" && req.user.role.name !== "superAdmin" && req.user.role.name !== "brand") {
                    return cb(new Error("Access Denied! you don't have correct privileges to perform this action", {
                        cause: {
                            statusCode: 401
                        }
                    }));
                }
                cb(null);
            },

            saveFile: function (cb) {
                s3Utils.uploadFileToS3(req.files.foodImage, cb);
            },

            existingFoodCheck: function (filePath, cb) {
                foodModel.findOne({
                    name: foodName,
                    "brand.name": brand.name,
                    isDeleted: false
                })
                    .then(function (existingFoodItem) {
                        if (existingFoodItem) {
                            return cb(new Error("food item already exist", {
                                cause: {
                                    statusCode: 409
                                }
                            }));
                        }
                        cb(null, filePath);
                    })
                    .catch(function (err) {
                        cb(err);
                    })
            },

            createFoodItem: function (filePath, cb) {
                var foodItemData = new foodModel({
                    name: foodName,
                    price: foodPrice,
                    description: foodDesc,
                    imageUrl: filePath,
                    brand: brand,
                    category: category,
                    subCategory: subCategory,
                    isVeg: isVeg,
                    taxes: taxes
                });
                foodItemData
                    .save()
                    .then(function (foodItem) {
                        cb(null, foodItem);
                    })
                    .catch(function (err) {
                        cb(err);
                    })
            }
        }), function (error, foodItemData) {
            if (error) {
                console.log(error);
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(201).json({
                foodItemData: foodItemData,
                message: "food item saved successfully"
            })
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        });
    }
}

exports.displayFoodItem = function (req, res, next) {
    try {
        // search filters 
        var brandId = req.query.brandId;
        var minPrice = req.query.minPrice;
        var maxPrice = req.query.maxPrice;
        var minRating = req.query.minRating;
        var isVeg = req.query.isVeg;
        var foodName = req.query.foodName;
        var subCategory = req.query.subCategory;
        var category = req.query.category;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;
        var totalFoodItems;

        var matchQuery = {
            $and: [],
            isDeleted: {
                $in: [null, false]
            }
        };

        if (minPrice) {
            matchQuery["$and"].push({
                price: {
                    $gte: minPrice
                }
            });
        }
        if (maxPrice) {
            matchQuery["$and"].push({
                price: {
                    $lte: maxPrice
                }
            })
        }
        if (minRating) {
            matchQuery["$and"].push({
                rating: {
                    $gte: minRating
                }
            })
        }
        if (isVeg !== undefined) {
            matchQuery["isVeg"] = isVeg;
        }
        // if (foodName) {
        //     matchQuery["name"] = {
        //         $regex: foodName,
        //         $options: "i"
        //     }
        // }
        if (subCategory) {
            matchQuery["subCategory"] = subCategory;
        }
        if (category) {
            matchQuery["category"] = category;
        }
        if (brandId) {
            matchQuery["brand.id"] = brandId;
        }
        if (matchQuery.$and.length === 0) {
            delete matchQuery["$and"];
        }
        // display food items based on match query! 
        foodModel
            .countDocuments(matchQuery)
            .then(function (totalItems) {
                totalFoodItems = totalItems;
                return foodModel
                    .find(matchQuery)
                    .skip(skip)
                    .limit(limit)
            })
            .then(function (matchedFoodItems) {
                return res.status(200).json({
                    matchedFoodItems: matchedFoodItems,
                    message: "success!",
                    totalFoodItems:totalFoodItems
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
        });
    }
}

exports.editFoodItem = function (req, res, next) {
    try {
        var foodName = req.body.name;
        var foodPrice = req.body.price;
        var foodDesc = req.body.foodDesc;
        var category = req.body.category;
        var subCategory = req.body.subCategory;
        var foodItemId = req.body.foodItemId;

        var role = req.user.role;
        var brandId = req.user.userId;

        var isOutletAuthorized = req.user.permissions.find(function (permission) {
            return permission.permissionName === 'Manage Food Items';
        })

        if (role !== "brand" && !isOutletAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var foodData;

        foodModel
            .findOne({
                _id: foodItemId,
                isDeleted: false
            })
            .then(function (foodItemData) {
                foodData = foodItemData;
                if (!foodItemData) {
                    throwError("food item not found", 404);
                }
                return foodModel.updateOne({
                    _id: ObjectId(foodItemId),
                    isDeleted: false
                }, {
                    $set: {
                        name: foodName,
                        price: foodPrice,
                        description: foodDesc,
                        category: category,
                        subCategory: subCategory
                    }
                })
            })
            .then(function () {
                brandUtils.changeNotificationForOutlets('Food Items Updated!',
                    `${foodName} is recently updated by your brand, Please Check the updated Item(s)
                    changes detected - 
                    Food Name : ${foodData.name} to ${foodName}
                    Food Price : ${foodData.price} to ${foodPrice}`
                    , brandId)
                return res.status(200).json({
                    message: "food item updated successfully"
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

exports.deleteFoodItem = function (req, res, next) {
    try {
        var foodItemId = req.query.foodItemId;
        if (req.user.role !== "admin" && req.user.role !== "superAdmin" && req.user.role !== "brand") {
            throwError("Access Denied! you don't have correct privileges to perform this action", 401);
        }
        foodModel.updateOne({
            _id: ObjectId(foodItemId),
            isDeleted: false
        }, {
            $set: {
                isDeleted: true
            }
        })
            .then(function () {
                return res.status(200).json({
                    message: "food item deleted successfully"
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
// var ObjectId = require("mongoose").Types.ObjectId;
// console.log([ObjectId("63711a74e11197253c3dff7f"),ObjectId("63a01a8fa467e68022aca2ca"),ObjectId("63a01a8fa467e68022aca2cb"),ObjectId("63a01a8fa467e68022aca2cc"),ObjectId("63a01a8fa467e68022aca2cd")].at(3));
