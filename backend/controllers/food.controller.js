const foodModel = require("../models/food.model");

var throwError = require("../utils/errors");

exports.addOrEditFoodItem = function (req, res, next) {
    try {
        // console.log(req.file);
        var foodName = req.body.foodName;
        var foodPrice = req.body.foodPrice;
        var foodDesc = req.body.foodDesc;
        var outletName = req.body.outletName;
        var category = req.body.category;
        var subCategory = req.body.subCategory;
    
        var foodImage = 'http://localhost:8080/public/' + req.file.filename;
        var isVeg = req.body.isVeg;
        var existingFoodItemId = req.body.existingFoodItemId;
        // checking the allowed role for creating food item
        if (req.user.role !== "admin" && req.user.role !== "superAdmin" && req.user.role !== "outlet") {
            throwError("Access Denied! you don't have correct privileges to perform this action", 401);
        }
        // checking if item already exist or if item need to edit by id;
        foodModel.findOne({
            $or: [
                {
                    name: foodName,
                    "outlet.name": outletName
                },
                {
                    _id: existingFoodItemId
                }
            ]
        })
            .then(function (existingFoodItem) {
                if (existingFoodItem) {
                    if (!existingFoodItemId) {
                        throwError("food item already exist!", 403);
                    }
                    return foodModel.findOneAndUpdate({
                        _id: existingFoodItemId
                    },
                        {
                            name: foodName ? foodName : existingFoodItem.name,
                            price: foodPrice ? foodPrice : existingFoodItem.price,
                            imageUrl: foodImage ? foodImage : existingFoodItem.imageUrl,
                            foodDesc: foodDesc ? foodDesc : existingFoodItem.foodDesc,
                            isVeg: (isVeg === undefined) ? existingFoodItem.isVeg : isVeg
                        });
                }
                var foodItemData = new foodModel({
                    name: foodName,
                    price: foodPrice,
                    description: foodDesc,
                    imageUrl: foodImage,
                    outlet: {
                        name:outletName
                    },
                    category:category,
                    subCategory:subCategory,
                    isVeg: isVeg
                });
                return foodItemData.save();
            })
            .then(function (foodItemData) {
                return res.status(201).json({
                    foodItemData: foodItemData,
                    message: "food item edit/saved successfully"
                })
            })
            .catch(function (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
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
        var outletId = req.query.outletId;
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
        if(outletId){
            matchQuery["outletId"] = outletId;
        }
        if(matchQuery.$and.length === 0){
            delete matchQuery["$and"];
        }
        console.log(matchQuery);
        foodModel.find(matchQuery)
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

exports.deleteFoodItem = function (req, res, next) {
    try {
        var foodItemId = req.query.foodItemId;
        if (req.user.role !== "admin" && req.user.role !== "superAdmin" && req.user.role !== "outlet") {
            throwError("Access Denied! you don't have correct privileges to perform this action", 401);
        }
        foodModel.findByIdAndDelete(foodItemId)
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