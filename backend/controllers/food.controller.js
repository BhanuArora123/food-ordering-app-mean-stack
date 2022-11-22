var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");

var ObjectId = require("mongoose").Types.ObjectId;

var async = require("async");

var fileUtils = require("../utils/uploadFile");

var utils = require("../utils/utils");

exports.addFoodItem = function (req, res, next) {
    try {
        var foodName = req.body.foodName;
        var foodPrice = req.body.foodPrice;
        var foodDesc = req.body.foodDesc;
        var brand = JSON.parse(req.body.brand);
        var category = req.body.category;
        var subCategory = req.body.subCategory;
        var isVeg = req.body.isVeg;

        async.waterfall(utils.convertToArray({

            verifyRole: function (cb) {
                // checking the allowed role for creating food item
                if (req.user.role !== "admin" && req.user.role !== "superAdmin" && req.user.role !== "brand") {
                    return cb(new Error("Access Denied! you don't have correct privileges to perform this action", {
                        cause: {
                            statusCode: 401
                        }
                    }));
                }
                cb(null);
            },

            saveFile: function (cb) {
                fileUtils.saveFile(cb, req.files.foodImage);
            },

            existingFoodCheck: function (filePath,cb) {
                foodModel.findOne({
                    name: foodName,
                    "brand.name": brand.name
                })
                    .then(function (existingFoodItem) {
                        if (existingFoodItem) {
                            return cb(new Error("food item already exist", {
                                cause: {
                                    statusCode: 409
                                }
                            }));
                        }
                        cb(null,filePath);
                    })
                    .catch(function (err) {
                        cb(err);
                    })
            },

            createFoodItem : function (filePath,cb) {
                var foodItemData = new foodModel({
                    name: foodName,
                    price: foodPrice,
                    description: foodDesc,
                    imageUrl: filePath,
                    brand: brand,
                    category: category,
                    subCategory: subCategory,
                    isVeg: isVeg
                });
                foodItemData
                .save()
                .then(function (foodItem) {
                    cb(null,foodItem);
                })
                .catch(function (err) {
                    cb(err);
                })
            }
        }), function (error,foodItemData) {
            if(error){
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

        var matchQuery = {
            $and: [],
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
        if (foodName) {
            matchQuery["name"] = {
                $regex: foodName,
                $options: "i"
            }
        }
        if (brandId) {
            matchQuery["brand.id"] = brandId;
        }
        if (matchQuery.$and.length === 0) {
            delete matchQuery["$and"];
        }
        // display food items based on match query! 
        foodModel
            .find(matchQuery)
            .then(function (matchedFoodItems) {
                return res.status(200).json({
                    matchedFoodItems: matchedFoodItems,
                    message: "success!"
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

        foodModel
            .findById(foodItemId)
            .then(function (foodItemData) {
                if (!foodItemData) {
                    throwError("food item not found", 404);
                }
                return foodModel.updateOne({
                    _id: ObjectId(foodItemId)
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
        foodModel.deleteOne({
            _id: ObjectId(foodItemId)
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