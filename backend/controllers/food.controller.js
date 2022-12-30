var foodModel = require("../models/food.model");

var throwError = require("../utils/errors");

var ObjectId = require("mongoose").Types.ObjectId;

var async = require("async");

var s3Utils = require("../utils/aws/s3/utils");

var utils = require("../utils/utils");

var brandUtils = require("../utils/brands.utils");
const categoryModel = require("../models/category.model");
const subCategoryModel = require("../models/subCategory.model");
const orderModel = require("../models/order.model");

exports.addFoodItem = function (req, res, next) {
    try {

        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "brand"
        }, "Manage Dishes");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }

        var foodName = req.body.foodName;
        var foodPrice = req.body.foodPrice;
        var foodDesc = req.body.foodDesc;
        var brand = JSON.parse(req.body.brand);
        var category = JSON.parse(req.body.category);
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
            isDeleted: false
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
        if (subCategory) {
            matchQuery["category.subCategory.name"] = subCategory;
        }
        if (category) {
            matchQuery["category.name"] = category;
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
                    totalFoodItems: totalFoodItems
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
        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "brand"
        }, "Manage Dishes");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var foodName = req.body.name;
        var foodPrice = req.body.price;
        var foodDesc = req.body.foodDesc;
        var category = req.body.category;
        var subCategory = req.body.subCategory;
        var foodItemId = req.body.foodItemId;

        var brandId = req.query.brandId;
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
        var role = req.user.role;
        var permissions = req.user.permissions;

        var isUserAuthorized = utils.isUserAuthorized(role, permissions, {
            name: "brand"
        }, "Manage Dishes");

        if (!isUserAuthorized) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var foodItemId = req.query.foodItemId;
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

// const a = async () => {
//     // const data = [];
//     // const categories = await categoryModel.find();
//     // const subcategories = await subCategoryModel.find();
//     // const categoryMap = {};
//     // const subCategoryMap = {};
//     // categories.forEach((category) => {
//     //     categoryMap[category.name] = category;
//     // })

//     // subcategories.forEach((category) => {
//     //     subCategoryMap[category.name] = category;
//     // })

//     // const subCategories = await subCategoryModel.find();

//     // for (let i = 0; i < subCategories.length; i++) {
//     //     const ele = subCategories[i];
//     //     const category = categoryMap[ele._doc.parentCategory]
//     //     data.push()
//     // }

//     // const allOrders = await orderModel.find();

//     // for (let i = 0; i < allOrders.length; i++) {
//     //     const order = allOrders[i];
//     //     var arr = order._doc.orderedItems.map(item => {
//     //         if(!item.subCategory){
//     //             return undefined;
//     //         }
//     //         return {
//     //             ...item,
//     //             category:{
//     //                 name:item.category,
//     //                 id:categoryMap[item.category]._id,
//     //                 subCategory:{
//     //                     name:item.subCategory,
//     //                     id:subCategoryMap[item.subCategory]._id
//     //             },
//     //             subCategory:null
//     //         }
//     //     }
//     // }).filter((data) => {
//     //     if(!data){
//     //         return false;
//     //     }
//     //     return data;
//     // })
//     // data.push({
//     //     ...order._doc,
//     //     orderedItems:arr,
//     //     _id:null
//     // })
//     // }


//     // await subCategoryModel.insertMany(data);
//     // await subCategoryModel.deleteMany({
//     //     "parentCategory.id":null
//     // })
//     // const foods = await foodModel.find();
//     //     for (let i = 0; i < foods.length; i++) {
//     //         const foodItem = foods[i];
//     //         if(foodItem._doc.category.subCategory && foodItem._doc.category.subCategory.name){
//     //             continue;
//     //         }
//     //         // console.log(category,foodItem._doc.subCategory);f
//     //         const category = categoryMap[foodItem.category];
//     //         const subCategory = subCategoryMap[foodItem._doc.subCategory];
//     //         if(!subCategory || !category){
//     //             console.log(i,"blocked");
//     //             continue;
//     //         }
//     //         foodItem.category = {
//     //             id:category._id,
//     //             name:category.name,
//     //             subCategory:{
//     //                 id:subCategory._id,
//     //                 name:subCategory.name
//     //             }
//     //         }
//     //         foodItem._doc.subCategory = null;
//     //         foodItem._id = null;
//     //         console.log(i,"allowed");
//     //         data.push(foodItem);
//     //         // await foodItem.save();
//     //     }
//     //     console.log(data);
//         // await orderModel.deleteMany({
//         //     "orderedItems":{
//         //         $elemMatch:{
//         //             "category.id":null
//         //         }
//         //     }
//         // });
//     //     await foodModel.deleteMany({
//     //         "category.id":null
//     //     });
//         console.log("done");
//     }
// var execute = async function () {
//     var outletDocs = [];
//     const categories = await categoryModel.find();
//     const subcategories = await subCategoryModel.find();
//     const categoryMap = {};
//     const subCategoryMap = {};
//     categories.forEach((category) => {
//         categoryMap[category.name] = category;
//     })

//     subcategories.forEach((category) => {
//         subCategoryMap[category.name] = category;
//     })

//     // const subCategories = await subCategoryModel.find();

//     // for (let i = 0; i < subCategories.length; i++) {
//     //     const ele = subCategories[i];
//     //     const category = categoryMap[ele._doc.parentCategory]
//     //     data.push()
//     // }
//     for (let i = 0; i < 5000; i++) {
//         console.log(i);
//         var newFood = {
//             createdAt: new Date(),
//             orderedItems: [
//                 {
//                     foodItemId: new ObjectId("63ac079dc44f5af2198580d1"),
//                     foodName: 'pizza 234',
//                     foodPrice: 23,
//                     quantity: 1,
//                     category: {
//                         id:categoryMap['fast food']._id,
//                         name:categoryMap['fast food'].name,
//                         subCategory:{
//                             id:subCategoryMap['non veg']._id,
//                             name:subCategoryMap['non veg'].name
//                         }
//                     },
//                     taxes: [{
//                         percentage:6,
//                         tax:{
//                             name:"GST",
//                             percentageRange:{
//                                 lowerBound:5,
//                                 upperBound:18
//                             }
//                         }
//                     }],
//                 },
//                 {
//                     foodItemId: new ObjectId("63ac079dc44f5af2198580dc"),
//                     foodName: 'noodles123467',
//                     foodPrice: 12,
//                     quantity: 2,
//                     category: {
//                         id:categoryMap['fast food']._id,
//                         name:categoryMap['fast food'].name,
//                         subCategory:{
//                             id:subCategoryMap['veg']._id,
//                             name:subCategoryMap['veg'].name
//                         }
//                     },
//                     taxes: [{
//                         percentage:6,
//                         tax:{
//                             name:"GST",
//                             percentageRange:{
//                                 lowerBound:5,
//                                 upperBound:18
//                             }
//                         }
//                     }]
//                 },
//                 {
//                     foodItemId: new ObjectId("63ac079dc44f5af2198580da"),
//                     foodName: 'noodles',
//                     foodPrice: 12,
//                     quantity: 2,
//                     category: {
//                         id:categoryMap['fast food']._id,
//                         name:categoryMap['fast food'].name,
//                         subCategory:{
//                             id:subCategoryMap['veg']._id,
//                             name:subCategoryMap['veg'].name
//                         }
//                     },
//                     taxes: [{
//                         percentage:6,
//                         tax:{
//                             name:"GST",
//                             percentageRange:{
//                                 lowerBound:5,
//                                 upperBound:18
//                             }
//                         }
//                     }],
//                     _id: new ObjectId("639c081bab4e83b4bd2659f2")
//                 },
//                 {
//                     foodItemId: new ObjectId("63ac079dc44f5af2198580ce"),
//                     foodName: 'dish99',
//                     foodPrice: 9,
//                     quantity: 2,
//                     category: {
//                         id:categoryMap['italian']._id,
//                         name:categoryMap['italian'].name,
//                         subCategory:{
//                             id:subCategoryMap['subitalian']._id,
//                             name:subCategoryMap['subitalian'].name
//                         }
//                     },
//                     taxes: [{
//                         percentage:6,
//                         tax:{
//                             name:"GST",
//                             percentageRange:{
//                                 lowerBound:5,
//                                 upperBound:18
//                             }
//                         }
//                     }],
//                     _id: new ObjectId("639c081bab4e83b4bd2659f3")
//                 },
//                 {
//                     foodItemId: new ObjectId("63ac079dc44f5af2198580cd"),
//                     foodName: 'dish12',
//                     foodPrice: 15,
//                     quantity: 1,
//                     category: {
//                         id:categoryMap['Indian']._id,
//                         name:categoryMap['Indian'].name,
//                         subCategory:{
//                             id:subCategoryMap['South Indian']._id,
//                             name:subCategoryMap['South Indian'].name
//                         }
//                     },
//                     taxes: [
//                         {
//                             percentage:6,
//                             tax:{
//                                 name:"GST",
//                                 percentageRange:{
//                                     lowerBound:5,
//                                     upperBound:18
//                                 }
//                             }
//                         }
//                     ],
//                     _id: new ObjectId("639c081bab4e83b4bd2659f4")
//                 }
//             ],
//             amountPaid: 104,
//             outlet: { id: ObjectId("6371291b0f6d4932bc863cbe"), name: 'outlet2' },
//             customer: {
//                 customer: {
//                     name: 'Bhanu Arora',
//                     phoneNumber: '9213311703',
//                     brandId: new ObjectId("63711a74e11197253c3dff7f"),
//                     outletId: new ObjectId("6371291b0f6d4932bc863cbe"),
//                     _id: new ObjectId("63907fa140c40653c9e4d559")
//                 },
//                 paidVia: 'Card'
//             },
//             brand: { id: ObjectId("63711a74e11197253c3dff7f"), name: 'brand1' },
//             orderType: i > 2500 ? 'Dine In' : 'Take Away',
//             assignedTable: i > 2500 ? `${((i % 10) + 1)}` : null,
//             status:"Closed"
//         };

//         outletDocs.push(newFood);
//     }
//     console.log(outletDocs);
//     await orderModel.insertMany(outletDocs);
//     console.log("done");
// }

// execute();