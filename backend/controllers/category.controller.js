var subCategoryModel = require("../models/subCategory.model");

var categoryModel = require("../models/category.model");
var throwError = require("../utils/errors");
var foodModel = require("../models/food.model");

var ObjectId = require("mongoose").Types.ObjectId;

exports.createCategory = function (req, res, next) {
    try {
        var categoryName = req.body.category;
        categoryModel
            .findOne({
                name: categoryName
            })
            .then(function (category) {
                if (category) {
                    throwError("category already exist", 409);
                }
                var newCategory = new categoryModel({
                    name: categoryName
                });
                return newCategory.save();
            })
            .then(function (category) {
                return res.status(201).json({
                    message: "category created successfully"
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

exports.getAllCategories = function (req, res, next) {
    try {
        categoryModel
            .find()
            .limit(9)
            .then(function (categories) {
                return res.status(200).json({
                    message: "categories fetched successfully :)",
                    categories: categories
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
        })
    }
}

exports.createSubCategory = function (req, res, next) {
    try {
        var subCategoryName = req.body.subCategoryName;
        var category = req.body.category;
        subCategoryModel
            .findOne({
                name: subCategoryName,
                parentCategory: category
            })
            .then(function (subCategory) {
                if (subCategory) {
                    throwError("category already exist", 409);
                }
                var newSubCategory = new subCategoryModel({
                    name: subCategoryName,
                    parentCategory: category
                });
                return newSubCategory.save();
            })
            .then(function (newSubCategory) {
                return res.status(201).json({
                    message: "category created successfully",
                    subCategory: newSubCategory
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

exports.getSubCategories = function (req, res, next) {
    try {
        var categoryId = req.query.categoryId;

        subCategoryModel.find({
            "parentCategory.id": categoryId
        },{
            name:1,
            _id:1
        })
            .then(function (subCategories) {
                return res.status(200).json({
                    subCategories: subCategories,
                    message: "subCategories fetched successfully!"
                });
            })
            .catch(function (error) {
                return res.status(500).json({
                    message: error.message
                })
            })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getCategoriesForBrand = function (req, res, next) {
    try {
        var brandId = req.query.brandId;

        foodModel.aggregate([
            {
                $match: {
                    "brand.id": ObjectId(brandId),
                    isDeleted: {
                        $ne:true
                    }
                }
            },
            {
                $group: {
                    _id: {
                        category: "$category.id",
                        subCategory: "$category.subCategory.id"
                    },
                    category:{
                        $first:"$category"
                    }
                }
            },
            {
                $group: {
                    _id: "$category.id",
                    category: {
                        $first: "$category"
                    },
                    subCategories: {
                        $push: "$category.subCategory"
                    }
                }
            }
        ])
            .then(function (categories) {
                return res.status(200).json({
                    message: "available categories fetched successfully!",
                    categories: categories
                });
            })
            .catch(function (error) {
                console.log(error);
                return res.status(500).json({
                    message: error.message
                })
            })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
} 