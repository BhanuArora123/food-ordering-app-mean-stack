var async = require("async");
var moment = require("moment");
var offers = require("../models/offers.model").model;
var outletsModel = require("../models/outlets.model");

var ObjectId = require("mongoose").Types.ObjectId;
var throwError = require("../utils/errors");
const orderModel = require("../models/order.model");

exports.createOffer = function (req, res, next) {
    try {
        var offerName = req.body.offerName;
        var offerDiscount = req.body.offerDiscount;
        var offerDescription = req.body.offerDescription;
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;
        var maximumUse = req.body.maximumUse;
        var orderType = req.body.orderType;
        var brand = req.body.brand;

        async.waterfall([
            function (cb) {
                offers.findOne({
                    name: offerName,
                    "brand.id": brand.id
                })
                    .then(function (offerData) {
                        if (offerData) {
                            return cb(new Error("an offer with this name already exist", {
                                cause: {
                                    statusCode: 409
                                }
                            }))
                        }
                        cb(null);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                var newOffer = new offers({
                    name: offerName,
                    discount: parseInt(offerDiscount),
                    description: offerDescription,
                    maximumUse: maximumUse,
                    brand: brand,
                    startFrom: startDate,
                    validTill: endDate,
                    orderType:orderType
                })
                newOffer.save()
                    .then(function (offerData) {
                        cb(null, offerData);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error, offerData) {
            if (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "offer created successfully!",
                offerData: offerData
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getOffersForBrand = function (req, res, next) {
    try {
        var brandId = req.query.brandId;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var skip = (page - 1) * limit;

        async.parallel([
            function (cb) {
                offers.countDocuments({
                    "brand.id": brandId
                })
                    .then(function (totalOffers) {
                        cb(null, totalOffers);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                var currentDate = moment().toDate();
                offers.find({
                    "brand.id": brandId,
                    isDeleted:false
                }, {
                    name: 1,
                    discount: 1,
                    maximumUse: 1,
                    description: 1,
                    startFrom: 1,
                    validTill: 1,
                    orderType:1,
                    isCouponActive:{
                        $cond:[
                            {
                                $and:[
                                    {
                                        $lte:["$startForm",currentDate],
                                    },
                                    {
                                        $gte:["$validTill",currentDate]
                                    }
                                ]
                            },1,0
                        ]
                    },
                })
                    .sort({
                        isCouponActive:-1,
                        discount:-1
                    })
                    .skip(skip)
                    .limit(limit)
                    .then(function (offers) {
                        cb(null, offers);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error, offersData) {
            if (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "offers fetched successfully!",
                offers: offersData[1],
                totalOffers:offersData[0]
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getAllApplicableOffers = function (req, res, next) {
    try {
        var brandId = req.query.brandId;
        var outletId = req.query.outletId;
        var orderType = req.query.orderType;
        var page = parseInt(req.query.page);
        var limit = parseInt(req.query.limit);
        var customerId = req.query.customerId;
        var skip = (page - 1) * limit;
        var currentDate = moment().toDate();

        async.waterfall([
            function (cb) {
                orderModel.aggregate([
                    {
                        $unwind: "$offersUsed"
                    },
                    {
                        $match: {
                            "brand.id": ObjectId(brandId),
                            "customer.customer._id": ObjectId(customerId),
                            "offersUsed.startFrom":{
                                $lte:currentDate
                            },
                            "offersUsed.validTill":{
                                $gte:currentDate
                            },
                            "offersUsed.orderType":{
                                $in:["Both",orderType]
                            }
                        },
                    },
                    {
                        $group: {
                            _id: "$offersUsed._id",
                            totalUse: {
                                $sum: 1
                            },
                            maxAllowedUse: {
                                $first: "$offersUsed.maximumUse"
                            }
                        }
                    },
                    {
                        $match: {
                            $expr:{
                                $gte:["$totalUse","$maxAllowedUse"]
                            }
                        }
                    }
                ])
                    .then(function (customerNotAllowedCoupons) {
                        console.log(customerNotAllowedCoupons);
                        return cb(null, customerNotAllowedCoupons);
                    })
                    .catch(function (error) {
                        return cb(error);
                    })
            },
            function (customerNotAllowedCoupons, cb) {
                var notAllowedCoupons = customerNotAllowedCoupons.map(function (coupon) {
                    return ObjectId(coupon._id);
                })
                outletsModel.aggregate([
                    {
                        $match: {
                            _id: ObjectId(outletId),
                            "brand.id": ObjectId(brandId),
                        }
                    },
                    {
                        $addFields: {
                            availableOffers: {
                                $filter: {
                                    input: "$offers",
                                    cond: {
                                        $and:[
                                            {
                                                $lte: ["$$this.startFrom",currentDate]
                                            },
                                            {
                                                $gte: ["$$this.validTill",currentDate]
                                            },
                                            {
                                                $in:["$$this.orderType",["Both",orderType]]
                                            },
                                            {
                                                $not:{
                                                    $in: ["$$this._id",notAllowedCoupons]
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            offersAvailableCount: {
                                $size: "$availableOffers"
                            },
                            offersAvailable: {
                                $slice: [
                                    "$availableOffers",
                                    skip,
                                    limit
                                ]
                            }
                        }
                    }
                ])
                    .then(function (offersData) {
                        console.log(offersData);
                        return cb(null, offersData[0]);
                    })
                    .catch(function (error) {
                        return cb(error);
                    })
            }
        ], function (error, offersData) {
            if (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "applicable offers fetched successfully!",
                applicableOffers: offersData.offersAvailable,
                applicableOffersCount: offersData.offersAvailableCount
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.applyOffer = function (req, res, next) {
    try {
        var offerId = req.body.offerId;
        var outletId = req.body.outletId;
        var brandId = req.body.brandId;
        var customerId = req.body.customerId;
        var orderType = req.body.orderType;
        var offerDetails;

        var currentDate = moment().toDate();

        outletsModel.findOne({
            _id: outletId,
            "brand.id": brandId,
            offers: {
                $elemMatch: {
                    _id: ObjectId(offerId),
                    startFrom: {
                        $lte: currentDate
                    },
                    validTill: {
                        $gte: currentDate
                    },
                    orderType:{
                        $in:["Both",orderType]
                    }
                }
            }
        })
            .then(function (offerData) {
                if (!offerData) {
                    throwError("offer is no longer running or it's not applicable for you")
                }
                offerDetails = offerData;
                // check if this customer has already used this coupon 
                return orderModel.countDocuments({
                    "customer.customer._id": ObjectId(customerId),
                    offersUsed: {
                        $elemMatch: {
                            _id: ObjectId(offerId)
                        }
                    }
                })
            })
            .then(function (offerUsedCount) {
                if (offerUsedCount >= offerDetails.maximumUse) {
                    throwError("offer usage limit exceeded", 400);
                }
                return res.status(200).json({
                    message: "offer applied successfully!"
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

exports.editOffer = function (req, res, next) {
    try {
        var offerId = req.body.offerId;
        var brandId = req.body.brandId;

        var discount = req.body.discount;
        var maximumUse = req.body.maximumUse;
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;
        var description = req.body.description;
        var orderType = req.body.orderType;

        async.parallel([
            function (cb) {
                offers.updateOne({
                    _id: ObjectId(offerId),
                    "brand.id": brandId
                }, {
                    $set: {
                        discount: discount,
                        maximumUse: maximumUse,
                        startFrom: startDate,
                        validTill: endDate,
                        description: description,
                        orderType:orderType
                    }
                })
                    .then(function (offerData) {
                        if (!offerData.matchedCount) {
                            throwError("offer doesn't exist or you don't have access to edit it")
                        }
                        cb(null);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                outletsModel.updateMany({
                    "brand.id": ObjectId(brandId),
                    offers: {
                        $elemMatch: {
                            _id: ObjectId(offerId)
                        }
                    }
                }, {
                    "offers.$[matchedOffer].discount": discount,
                    "offers.$[matchedOffer].maximumUse": maximumUse,
                    "offers.$[matchedOffer].startFrom": startDate,
                    "offers.$[matchedOffer].validTill": endDate,
                    "offers.$[matchedOffer].description": description,
                    "offers.$[matchedOffer].orderType": orderType
                }, {
                    arrayFilters: {
                        "matchedOffer._id": ObjectId(offerId)
                    }
                })
                    .then(function () {
                        cb(null);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                orderModel.updateMany({
                    "brand.id": ObjectId(brandId),
                }, {
                    "offersUsed.$[matchedOffer].discount": discount,
                    "offersUsed.$[matchedOffer].maximumUse": maximumUse,
                    "offersUsed.$[matchedOffer].startFrom": startDate,
                    "offersUsed.$[matchedOffer].validTill": endDate,
                    "offersUsed.$[matchedOffer].description": description,
                    "offersUsed.$[matchedOffer].orderType": orderType
                }, {
                    arrayFilters: {
                        "matchedOffer._id": ObjectId(offerId)
                    }
                })
                    .then(function () {
                        cb(null);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error) {
            if (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "offer edited successfully!",
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.deleteOffer = function (req, res, next) {
    try {
        var offerId = req.query.offerId;
        var brandId = req.query.brandId;

        async.parallel([
            function (cb) {
                offers.updateOne({
                    _id: ObjectId(offerId),
                    "brand.id": ObjectId(brandId)
                }, {
                    $set: {
                        isDeleted: true
                    }
                })
                    .then(function (offerData) {
                        console.log(offerData);
                        if (!offerData.matchedCount) {
                            throwError("offer doesn't exist or you don't have access to edit it")
                        }
                        cb(null);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            },
            function (cb) {
                outletsModel.updateMany({
                    "brand.id": ObjectId(brandId),
                    offers: {
                        $elemMatch: {
                            _id: ObjectId(offerId)
                        }
                    }
                }, {
                    $pull: {
                        "offers": {
                            _id: ObjectId(offerId)
                        }
                    }
                })
                    .then(function () {
                        cb(null);
                    })
                    .catch(function (error) {
                        cb(error);
                    })
            }
        ], function (error) {
            if (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
                    message: error.message
                })
            }
            return res.status(200).json({
                message: "offer edited successfully!",
            })
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}