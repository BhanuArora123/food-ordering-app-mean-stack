var orders = require("../models/order.model");

var ObjectId = require("mongoose").Types.ObjectId;

var moment = require("moment");

exports.getAllItemsSoldCountHourly = function (req, res, next) {
    try {
        var startDate = req.query.startDate;
        var endDate = req.query.endDate;
        var selectedItems = JSON.parse(req.query.selectedFoodItems).map(function (item) {
            return ObjectId(item);
        });
        var brandId = req.query.brandId;
        var outletId = req.query.outletId;

        var matchQuery = {
            "orderedItems.foodItemId": {
                $in: selectedItems
            },
            createdAt: {
                $gte: moment(startDate).toDate(),
                $lte: moment(endDate).toDate()
            },
            "brand.id": ObjectId(brandId)
        }
        if (outletId) {
            matchQuery["outlet.id"] = ObjectId(outletId);
        }

        orders.aggregate([
            {
                $unwind: {
                    path: "$orderedItems"
                }
            },
            {
                $addFields: {
                    startHour: {
                        $hour: "$createdAt"
                    }
                }
            },
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: {
                        startHour: "$startHour",
                        foodItemId: "$orderedItems.foodItemId",
                    },
                    foodName: {
                        $first: "$orderedItems.foodName"
                    },
                    totalItems: {
                        $sum: "$orderedItems.quantity"
                    },
                    revenueGenerated: {
                        $sum: {
                            $multiply: ["$orderedItems.foodPrice", "$orderedItems.quantity"]
                        }
                    }
                }
            }
        ])
            .then(function (reportData) {
                return res.status(200).json({
                    message: "report generated successfully!",
                    reportData: reportData
                })
            })
            .catch(function (error) {
                console.log(error);
                return res.status(500).json({
                    message: error.message
                });
            })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

exports.getBrandRevenue = function (req, res, next) {
    try {
        var brandIds = JSON.parse(req.query.brandIds).map(function (brandId) {
            return ObjectId(brandId);
        });
        var startDate = req.query.startDate;
        var endDate = req.query.endDate;

        orders.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: moment(startDate).toDate(),
                        $lte: moment(endDate).toDate()
                    },
                    "brand.id": {
                        $in: brandIds
                    }
                }
            },
            {
                $group: {
                    _id: "$brand.id",
                    brandName: {
                        $first: "$brand.name"
                    },
                    totalRevenue: {
                        $sum: {
                            $subtract: ["$amountPaid", "$taxPaid"]
                        }
                    }
                }
            }
        ])
            .then(function (reportData) {
                return res.status(200).json({
                    message: "report generated successfully!",
                    reportData: reportData
                })
            })
            .catch(function (error) {
                console.log(error);
                return res.status(500).json({
                    message: error.message
                });
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        });
    }
}

exports.getMaxSoldItem = function (req, res, next) {
    try {
        var brandId = req.query.brandId;
        // var outletId = req.query.outletId;
        var startDate = req.query.startDate;
        var endDate = req.query.endDate;
        var requiredSoldItemCount = req.query.requiredSoldItemCount?req.query.requiredSoldItemCount:3;

        orders
            .aggregate([
                {
                    $match: {
                        "brand.id": ObjectId(brandId),
                        createdAt: {
                            $gte: moment(startDate).toDate(),
                            $lte: moment(endDate).toDate()
                        }
                    }
                },
                {
                    $unwind:{
                        path:"$orderedItems"
                    }
                },
                // {
                //     $addFields: {
                //         startHour: {
                //             $hour: "$createdAt"
                //         }
                //     }
                // },
                {
                    $group: {
                        _id: {
                            // startHour: "$startHour",
                            foodItemId: "$orderedItems.foodItemId"
                        },
                        foodName: {
                            $first:"$orderedItems.foodName"
                        },
                        foodPrice: {
                            $first:"$orderedItems.foodPrice"
                        },
                        totalRevenue:{
                            $sum:{
                                $multiply:["$orderedItems.foodPrice","$orderedItems.quantity"]
                            }
                        },
                        totalItems: {
                            $sum: "$orderedItems.quantity"
                        }
                    }
                },
                {
                    $sort: {
                        totalItems: -1
                    }
                },
                {
                    $limit: requiredSoldItemCount
                }
            ])
            .then(function (reportData) {
                return res.status(200).json({
                    message: "report generated successfully!",
                    reportData: reportData
                })
            })
            .catch(function (error) {
                console.log(error);
                return res.status(500).json({
                    message: error.message
                });
            })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        });
    }
}