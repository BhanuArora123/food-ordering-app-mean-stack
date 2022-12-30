var brands = require("../models/brands.model");
var users = require("../models/users.model");

var throwError = require("../utils/errors");
var outletsModel = require("../models/outlets.model");

var brandUtils = require("../utils/brands.utils");

var redisUtils = require("../utils/redis/redis.utils");

require("dotenv").config("./.env");

var utils = require("../utils/utils");

var orderModel = require("../models/order.model");
const usersModel = require("../models/users.model");

var ObjectId = require("mongoose").Types.ObjectId;

exports.getAllBrands = function (req, res, next) {
    try {
        var role = req.user.role;

        var permissions = req.user.permissions;

        var search = req.query.search;

        var limit = parseInt(req.query.limit);

        var page = parseInt(req.query.page);

        var skip = (page - 1) * limit;

        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"brand"
        },"Manage Brands");

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

        var totalBrands;
        brands
            .countDocuments(matchQuery)
            .then(function (availableBrandsCount) {
                totalBrands = availableBrandsCount;
                return brands
                    .find(matchQuery)
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
        var role = req.user.role;
        var permissions = req.user.permissions;
        var isUserAuthorized = utils.isUserAuthorized(role,permissions,{
            name:"brand"
        },"Manage Brands");

        if(!isUserAuthorized){
            return res.status(401).json({
                message: "Access Denied!"
            });
        }

        var brandId = req.body.brandId;
        var isDisabled = req.body.isDisabled;
        var name = req.body.name;

        var dataToUpdate = {};

        if (name) {
            dataToUpdate["name"] = name;
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
                        "brand.id": ObjectId(brandId)
                    }, {
                        $set: {
                            "brand.name": name
                        }
                    })
                    orderModel.updateMany({
                        "brand.id": ObjectId(brandId)
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
        var userSubRole = req.query.subRole;
        var page = parseInt(req.query.page || 1);
        var limit = parseInt(req.query.limit || 9);
        var skip = (page - 1)*limit;
        var brandUsersCount;

        var query = {
            "role.name":"brand",
            _id:{
                $ne:userId
            }
        };

        if(brandId){
            query["brands"] = {
                $elemMatch:{
                    id:brandId
                }
            }
        }

        if(userSubRole){
            query["role.subRoles"] = {
                $elemMatch:{
                    $eq:userSubRole
                }
            }
        }
        console.log(query);
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

// adding brands 

// const b = async () => {
//     var data = [];
//     const availableOutlets = await outletsModel.find();
//     const outletMap = {};
//     availableOutlets.forEach((brand) => {
//         outletMap[brand.name] = brand;
//     })
//     for(let i = 5003;i<10003;i++){
        // var outletData = {
        //     name : `outlet${i}`,
        //     admin:{
        //         name:`user${i}`,
        //         email:`user${i}@gmail.com`
        //     },
        //     brand:{
        //         id:brandMap[`brand${i - 5001}`]._id,
        //         name:brandMap[`brand${i - 5001}`].name
        //     },
        //     tables:[]
        // }
        // data.push(brandData);
        // var userData = {
        //     name:`user${i}`,
        //     email:`user${i}@gmail.com`,
        //     password:"$2a$12$xX4k5hs7JSedS1I2t1LgDuv8t3Kz6Qk5WlH8eK4iE/ynNGwbUr9Mq",
        //     outlets:[
        //         {
        //             id:outletMap[`outlet${i}`]._id,
        //             name:outletMap[`outlet${i}`].name,
        //             brand:outletMap[`outlet${i}`].brand,
        //         }
        //     ],
        //     role:{
        //         name:"outlet",
        //         subRoles:['admin']
        //     },
        //     permissions:[
        //         {
        //             permissionId: 1,
        //             permissionName: 'Manage Orders'
        //         },
        //         {
        //             permissionId: 2,
        //             permissionName: 'Allow Take Away Orders'
        //         },
        //         {
        //             permissionId: 3,
        //             permissionName: 'View Analytics'
        //         },
        //         {
        //             permissionId: 4,
        //             permissionName: 'Create Orders'
        //         },
        //         {
        //             permissionId: 5,
        //             permissionName: 'Manage Dishes'
        //         },
        //         {
        //             permissionId: 6,
        //             permissionName:'Manage Outlet Users'
        //         }
        //     ]
        // }
        // data.push(userData);
    // }
    // await usersModel.insertMany(data);
    // await outletsModel.insertMany(data);
//     console.log("done");
// }

// b();