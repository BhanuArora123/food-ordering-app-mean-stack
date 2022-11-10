var orderModel = require("../models/order.model");

exports.groupBasedOnCategory = function (matchQuery,skip,limit) {
    try {
        return orderModel.aggregate([
            {
                $match:matchQuery
            },
            {
                $unwind:"$orderedItems"
            },
            {
                $group:{
                    _id:{
                        subCategory:"$orderedItems.subCategory",
                        id:"$_id"
                    },
                    category:{
                        $first:"$orderedItems.category"
                    },
                    subCategorizedItems:{
                        $push:"$orderedItems"
                    },
                    amountPaid:{
                        $first:"$amountPaid"
                    },
                    status:{
                        $first:"$status"
                    }
                }
            },
            {
                $group:{
                    _id:{
                        category:"$category",
                        id:"$_id.id"
                    },
                    category:{
                        $first:"$category"
                    },
                    categorizedItems:{
                        $push:"$$ROOT"
                    },
                    status:{
                        $first:"$status"
                    }
                }
            },
            {
                $skip:skip
            },
            {
                $limit:limit
            }
        ])
        .then(function (matchedOrders) {
            return matchedOrders;
        })
        .catch(function (error) {
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}