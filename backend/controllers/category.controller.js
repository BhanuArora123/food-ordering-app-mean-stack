var subCategoryModel = require("../models/subCategory.model");

var categoryModel = require("../models/category.model");
var throwError = require("../utils/errors");

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
            .then(function (categories) {
                return res.status(200).json({
                    message:"categories fetched successfully :)",
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
                name: subCategoryName
            })
            .then(function (subCategory) {
                if (subCategory) {
                    throwError("category already exist", 409);
                }
                var newSubCategory = new subCategoryModel({
                    name:subCategoryName,
                    parentCategory:category
                });
                return newSubCategory.save();
            })
            .then(function (newSubCategory) {
                return res.status(201).json({
                    message: "category created successfully",
                    subCategory:newSubCategory
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
            message:error.message
        });
    }
}

exports.getSubCategories = function (req,res,next) {
    try {
        var category = req.query.category;
        
        subCategoryModel.find({
            parentCategory:category
        })
        .then(function (subCategories) {
            return res.status(200).json({
                subCategories:subCategories
            });
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