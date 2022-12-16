var sendEmail = require("../../email.utils").sendEmail;

var orders = require("../../../models/order.model");

var brandUtils = require("../../../utils/brands.utils");

var orderUtils = require("../../../utils/orders.utils");

var socketUtils = require("../../socket/socket.utils");

exports.sendEmailWorker = function (messageData,cb) {
    try {
        var messageConfig = JSON.parse(messageData.Body);
        sendEmail(messageConfig.email,messageConfig.subject,messageConfig.content,cb);
    } catch (error) {
        console.log(error);
    }
}

exports.createOrderWorker = function (messageData,cb) {
    try {
        console.log("triggered!");
        var messageConfig = JSON.parse(messageData.Body);
        // updating outlet asynchronously 
        var brandId = messageConfig.brandId;
        var outletName = messageConfig.outletName;
        var orderId = messageConfig.orderId;
        var assignedTable = messageConfig.assignedTable;
        var outletId = messageConfig.outletId;
        console.log(messageConfig);
        
        orders.findOne({
            _id:orderId
        })
        .then(function (orderData) {
            // update table in outlet 
            orderData.status = "Preparing";
            if(orderData.orderType === 'Dine In'){
                orderData.assignedTable = assignedTable;
                orderUtils.updateTable(outletId, assignedTable, {
                    isAssigned: true,
                    assignedOrderId: orderData._id
                })
            }
            return orderData.save();
        })
        .then(function (orderData) {
            // sending socket message for order creation 
            var serverInstance = socketUtils.getSocketInstance();
            brandUtils.sendOrderCreationEmail(brandId,outletName);
            serverInstance.in(brandId).emit("orderCreation",{
                orderId:orderData._id,
                message:"order created successfully, Status - Preparing!"
            })
            cb(null,"order started preparing!");
        })
    } catch (error) {
        
    }
}