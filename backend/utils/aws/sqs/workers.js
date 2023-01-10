var sendEmail = require("../../email.utils").sendEmail;

var orders = require("../../../models/order.model");

var customerModel = require("../../../models/customer.model").model;

var brandUtils = require("../../../utils/brands.utils");

var orderUtils = require("../../../utils/orders.utils");

var socketUtils = require("../../socket/socket.utils");

var throwError = require("../../errors");

exports.sendEmailWorker = function (messageData) {
    try {
        var messageConfig = JSON.parse(messageData.Body);
        sendEmail(messageConfig.email,messageConfig.subject,messageConfig.content);
    } catch (error) {
        console.log(error);
    }
}

exports.createOrderWorker = function (messageData) {
    try {
        var messageConfig = JSON.parse(messageData.Body);
        console.log(messageConfig);
        var assignedTable = messageConfig.assignedTable;
        var customer = messageConfig.customer;
        var cartItems = messageConfig.cartItems;
        var outlet = messageConfig.outlet;
        var brand = messageConfig.brand;
        var orderType = messageConfig.orderType;
        var offersUsed = messageConfig.offersUsed;

        customerModel.findOne({
            phoneNumber:customer.customer.phoneNumber.toString(),
            brandId:brand.id
        })
        .then(function (customerData) {
            if(customerData){
                if(customerData.name !== customer.customer.name){
                    throwError("a customer with this name and phone number already exist",409);
                }
                return customerData;
            }
            customer.customer.outletId = outlet.id;
            customer.customer.brandId = brand.id;
            var newCustomer = new customerModel(customer.customer);
            return newCustomer.save();
        })
        .then(function (customerData) {
            var totalPrice = cartItems.reduce(function (priceTillNow, currentCartItem) {
                return priceTillNow + (currentCartItem.quantity * currentCartItem.foodPrice)
            }, 0);
            var totalDiscount = offersUsed.reduce(function (discountTillNow,currentDiscount) {
                console.log(currentDiscount);
                return discountTillNow + (totalPrice*(currentDiscount.discount)*0.01);
            },0);
            console.log("totalDiscount - ",totalDiscount);
            var orderedItems = cartItems.map(function (cartItem) {
                return {
                    foodName: cartItem.foodName,
                    foodPrice: cartItem.foodPrice,
                    quantity: cartItem.quantity,
                    subCategory: cartItem.subCategory,
                    category: cartItem.category,
                    taxes:cartItem.taxes,
                    foodItemId:cartItem.foodItemId
                };
            })
            var newOrder = new orders({
                orderedItems: orderedItems,
                amountPaid: totalPrice,
                outletName: cartItems[0].outletName,
                createdAt: new Date(),
                outlet: outlet,
                customer: {
                    customer:customerData,
                    paidVia:customer.paidVia
                },
                brand: brand,
                orderType: orderType ? orderType : "Dine In",
                assignedTable:assignedTable,
                offersUsed:offersUsed,
                discountApplied:totalDiscount
            });
            return newOrder.save();
        })
        .then(function (orderData) {
            // update table in outlet 
            if(orderData.orderType === 'Dine In'){
                orderUtils.updateTable(outlet.id, assignedTable, {
                    isAssigned: true,
                    assignedOrderId: orderData._id
                })
            }
            // sending socket message for order creation 
            var serverInstance = socketUtils.getSocketInstance();
            brandUtils.sendOrderCreationEmail(brand.id,outlet.name);
            serverInstance.in(brand.id).emit("orderCreation",{
                orderData:orderData,
                message:"order created successfully, Status - Preparing!"
            })
        })
        .catch(function (error) {
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}