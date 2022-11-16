var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");

exports.addFoodItem = function (req, res, next) {
    try {
        var brandId = req.user.userId;
        
        console.log(req.body);
        var foodName = req.body.foodName;
        var foodPrice = req.body.foodPrice;
        var foodDesc = req.body.foodDesc;
        var brand = req.body.brand;
        var category = req.body.category;
        var subCategory = req.body.subCategory;

        var foodImage = 'http://localhost:8080/public/' + 'burger2022-11-13T18-16-41.667Z.jpg';
        var isVeg = req.body.isVeg;
        // checking the allowed role for creating food item
        if (req.user.role !== "admin" && req.user.role !== "superAdmin" && req.user.role !== "brand") {
            throwError("Access Denied! you don't have correct privileges to perform this action", 401);
        }

        // checking if item already exist
        foodModel.findOne({
            name: foodName,
            "brand.name": brand.name
        })
            .then(function (existingFoodItem) {
                if (existingFoodItem) {
                    throwError("food item already exist!", 403);
                }
                var foodItemData = new foodModel({
                    name: foodName,
                    price: foodPrice,
                    description: foodDesc,
                    imageUrl: foodImage,
                    brand: brand,
                    category: category,
                    subCategory: subCategory,
                    isVeg: isVeg
                });
                return foodItemData.save();
            })
            .then(function (foodItemData) {
                return res.status(201).json({
                    foodItemData: foodItemData,
                    message: "food item saved successfully"
                })
            })
            .catch(function (error) {
                console.log(error);
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

exports.deleteFoodItem = function (req, res, next) {
    try {
        var foodItemId = req.query.foodItemId;
        if (req.user.role !== "admin" && req.user.role !== "superAdmin" && req.user.role !== "brand") {
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