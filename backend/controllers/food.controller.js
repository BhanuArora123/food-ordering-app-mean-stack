const foodModel = require("../models/food.model");

exports.addOrEditFoodItem = function (req, res, next) {
    try {
        var foodName = req.body.foodName;
        var foodPrice = req.body.foodPrice;
        var foodDesc = req.body.foodDesc;
        var outletId = req.body.outletId;
        var foodImage = req.body.foodImage;
        var isVeg = req.body.isVeg;
        var existingFoodItemId = req.body.existingFoodItemId;
        // checking the allowed role for creating food item
        if (req.role !== "admin" && req.role !== "superadmin" && req.role !== "outlet") {
            return res.status(401).json({
                message: "Access Denied! you don't have correct privileges to perform this action"
            });
        }
        // checking if item already exist or if item need to edit by id;
        foodModel.findOne({
            $or: [
                {
                    name: foodName,
                    outletId: outletId
                },
                {
                    _id: existingFoodItemId
                }
            ]
        })
            .then(function (existingFoodItem) {
                if (existingFoodItem) {
                    if (!existingFoodItemId) {
                        return res.status(403).json({
                            message: "food item already exist!"
                        });
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
                    outletId: outletId,
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
                console.log(error);
                return res.status(500).json({
                    message: error.message
                });
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
            outletId: outletId
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
            matchQuery["foodName"] = {
                $regex: foodName,
                $options: "i"
            }
        }
        foodModel.find(matchQuery)
            .then(function (matchedFoodItems) {
                return res.status(200).json({
                    matchedFoodItems: matchedFoodItems,
                    message: "success!"
                })
            })
            .catch(function (error) {
                return res.status(500).json({
                    message: error.message
                })
            })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

exports.deleteFoodItem = function name(req,res,next) {
    try {
        var foodItemId = req.query.foodItemId;
        if (req.role !== "admin" && req.role !== "superadmin" && req.role !== "outlet") {
            return res.status(401).json({
                message: "Access Denied! you don't have correct privileges to perform this action"
            });
        }
        foodModel.findByIdAndDelete(foodItemId)
        .then(function () {
            return res.status(200).json({
                message:"food item deleted successfully"
            })
        })
        .catch(function (error) {
            return res.status(500).json({
                message:error.message
            })
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}