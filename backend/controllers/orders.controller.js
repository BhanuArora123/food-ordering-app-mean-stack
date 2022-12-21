var orders = require("../models/order.model");

var outlets = require("../models/outlets.model");

var throwError = require("../utils/errors");
var orderUtils = require("../utils/orders.utils");

const sqsUtils = require("../utils/aws/sqs/utils");
const getSocketInstance = require("../utils/socket/socket.utils").getSocketInstance;

var ObjectId = require("mongoose").Types.ObjectId;

var customerModel = require("../models/customer.model").model

exports.placeOrder = function (req, res, next) {
    try {
        var outletId = req.user.userId;
        var customer = req.body.customer;
        var brand = req.body.brand;
        var outlet = req.body.outlet;
        var orderType = req.body.orderType;
        var assignedTable = req.body.assignedTable;
        var cartItems = req.body.cart;

        outlets
            .findOne({
                _id:outlet.id
            })
            .then(function (outletData) {
                if (!outletData) {
                    throwError("outlet doesn't exist",404);
                }
                sqsUtils.addTaskToQueue("ORDER_CREATION",{
                    MessageBody: {
                        outlet:outlet,
                        brand:brand,
                        customer:customer,
                        cartItems:cartItems,
                        assignedTable:assignedTable?parseInt(assignedTable):undefined,
                        orderType:orderType
                    }
                });
                return res.status(201).json({
                    message: "Creating Order, Order Status - Pending"
                })
            })
            .catch(function (error) {
                console.log(error);
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

exports.getAllOrders = function (req, res, next) {
    try {

        var brandId = req.query.brandId;
        var customerId = req.query.customerId;

        // authorizing
        if (req.user.role !== "superAdmin" && req.user.role !== "admin" && req.user.userId !== brandId && req.user.brandId !== brandId && req.user.userId !== customerId ) {
            return res.status(401).json({
                message: "Access Denied!"
            })
        }
        var status = req.query.status;
        var orderType = req.query.orderType;
        var limit = parseInt(req.query.limit);
        var page = parseInt(req.query.page);
        var outletId = req.query.outletId;
        var totalOrders;

        var skip = (page - 1) * limit;

        var matchQuery = {};
        if(brandId){
            matchQuery["brand.id"] = brandId;
        }
        if (orderType) {
            matchQuery["orderType"] = orderType;
        }
        if (status) {
            matchQuery["status"] = status;
        }
        if(outletId){
            matchQuery["outlet.id"] = outletId;
        }
        if(customerId){
            matchQuery["customer.customer._id"] = customerId;
        }
        console.log(matchQuery);
        orders
        .countDocuments(matchQuery)
        .then(function (availableOrders) {
            totalOrders = availableOrders;
            return orders
            .find(matchQuery)
            .skip(skip)
            .limit(limit)
        })
            .then(function (matchedOrders) {
                return res.status(200).json({
                    message: "orders fetched successfully",
                    orders: matchedOrders,
                    totalOrders:totalOrders
                })
            })
            .catch(function (error) {
                var statusCode = error.cause ? error.cause.statusCode : 500;
                return res.status(statusCode).json({
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

exports.changeStatus = function (req, res, next) {
    try {
        var status = req.body.status;
        var orderId = req.body.orderId;
        var outletId = req.user.userId;
        var currentOrderData;

        orders
            .updateOne({
                _id: ObjectId(orderId)
            }, {
                $set: {
                    status: status
                }
            })
            .then(function () {
                return orders.findOne({
                    _id: ObjectId(orderId)
                });
            })
            .then(function (orderData) {
                currentOrderData = orderData;
                var socketInstance = getSocketInstance();
                socketInstance.to(orderData.customer.customer._id.toString()).emit("orderStatusChanged",{
                    orderData:orderData,
                    message:"Highlighted Order's Status is Changed!"
                })
                return outlets.findOne({
                    _id: outletId
                })
            })
            .then(function (outletData) {
                if (status === "Closed") {
                    orderUtils.updateTable(outletId, currentOrderData.assignedTable, {
                        isAssigned: false,
                        assignedOrderId: null
                    })
                }
                return outletData.save();
            })
            .then(function (outletData) {
                return res.status(200).json({
                    message: "order updated successfully",
                    orderData: currentOrderData
                })
            })
            .catch(function (error) {
                console.log(error);
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

exports.editOrder = function (req, res, next) {
    try {
        var outletId = req.user.userId;
        var orderId = req.body.orderId;
        var orderedItems = req.body.orderedItems;
        var tableToAssign = req.body.tableToAssign;

        var currentOrderData;
        // find order and check if it's dine in type order 
        var dataToUpdate = {
            orderedItems: orderedItems
        };
        if (tableToAssign) {
            dataToUpdate["assignedTable"] = tableToAssign;
        }

        orders.findOne({
            _id: ObjectId(orderId)
        })
            .then(function (orderData) {
                if (!orderData) {
                    throwError("Dine In Order is editable only! or order doesn't exist", 404);
                }
                currentOrderData = orderData;
                return orders.updateOne({
                    _id: ObjectId(orderId),
                    orderType: "Dine In"
                }, {
                    $set: dataToUpdate
                })
            })
            .then(function () {
                return orderUtils.changeUserTable(tableToAssign,currentOrderData,outletId);
            })
            .then(function () {
                return res.status(200).json({
                    message: "order updated successfully",
                })
            })
            .catch(function (error) {
                console.log(error);
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

// var execute = async function () {
//     var outletDocs = [];
//     for (let i = 0; i < 5000; i++) {
//         console.log(i);
//         var newFood = {
//             createdAt:new Date(),
//             orderedItems: [
//     {
//         foodItemId: new ObjectId("638fae1841df139c2f197d4f"),
//         foodName: 'pizza 234',
//         foodPrice: 23,
//         quantity: 1,
//         category: 'fast food',
//         subCategory: 'non veg',
//         taxes: [Array],
//         _id: new ObjectId("639c081bab4e83b4bd2659f0")
//       },
//       {
//         foodItemId: new ObjectId("63944f452ea3e9be03d4acf2"),
//         foodName: 'noodles123467',
//         foodPrice: 12,
//         quantity: 2,
//         category: 'fast food',
//         subCategory: 'veg',
//         taxes: [Array],
//         _id: new ObjectId("639c081bab4e83b4bd2659f1")
//       },
//       {
//         foodItemId: new ObjectId("63944b53cc10c4b370015523"),
//         foodName: 'noodles',
//         foodPrice: 12,
//         quantity: 2,
//         category: 'fast food',
//         subCategory: 'veg',
//         taxes: [Array],
//         _id: new ObjectId("639c081bab4e83b4bd2659f2")
//       },
//       {
//         foodItemId: new ObjectId("6377287a2d148937a0daed2d"),
//         foodName: 'dish99',
//         foodPrice: 9,
//         quantity: 2,
//         category: 'italian',
//         subCategory: 'subitalian',
//         taxes: [],
//         _id: new ObjectId("639c081bab4e83b4bd2659f3")
//       },
//       {
//         foodItemId: new ObjectId("6371fbf29a41aa2a90d4f3e5"),
//         foodName: 'dish12',
//         foodPrice: 15,
//         quantity: 1,
//         category: 'Indian',
//         subCategory: 'South Indian',
//         taxes: [],
//         _id: new ObjectId("639c081bab4e83b4bd2659f4")
//       }
//     ],
//             amountPaid: 104,
//             outlet: { id: ObjectId("6371291b0f6d4932bc863cbe"), name: 'outlet2' },
//             customer: {
//     customer: {
//         name: 'Bhanu Arora',
//         phoneNumber: '9213311703',
//         brandId: new ObjectId("63711a74e11197253c3dff7f"),
//         outletId: new ObjectId("6371291b0f6d4932bc863cbe"),
//         _id: new ObjectId("63907fa140c40653c9e4d559")
//       },
//       paidVia: 'Card'
//     },
//             brand: { id: ObjectId("63711a74e11197253c3dff7f"), name: 'brand1' },
//             orderType: i>2500?'Dine In':'Take Away',
//             assignedTable:i>2500?`${((i%10)+1)}`:null
//         };

//         outletDocs.push(newFood);
//     }
//     console.log(outletDocs);
//     await orders.insertMany(outletDocs);
//     console.log("done");
// }

// execute();

// // async function ex() {
// //     var orderData = await orders.findOne({
// //         _id:ObjectId("639c081bab4e83b4bd2659ee")
// //     })
// //     console.log(orderData);
// // }
// // ex();