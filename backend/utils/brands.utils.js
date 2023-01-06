var brands = require("../models/brands.model");

var outlet = require("../models/outlets.model");

var addTaskToQueue = require("../utils/aws/sqs/utils").addTaskToQueue;


exports.changeNotificationForOutlets = function (title, content, brandId) {
    try {
        return outlet.find({
            "brand.id": brandId
        })
            .then(function (outlets) {
                var outletEmails = outlets.map(function (outletData) {
                    return outletData.email;
                })
                // send email to brand 
                addTaskToQueue("SEND_EMAIL", {
                    MessageBody: {
                        email: outletEmails,
                        subject: title,
                        content: content
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
            })
    } catch (error) {
        console.log(error);
    }
}

exports.sendOrderCreationEmail = function name(brandId, outletName) {
    try {
        brands.findOne({
            _id: brandId,
            isDisabled: {
                $ne:true
            }
        })
            .then(function (brandData) {
                // send message to brand regarding an order 
                addTaskToQueue("SEND_EMAIL", {
                    MessageBody: {
                        email: brandData.admin.email,
                        subject: "Order Creation Message",
                        content: `An new order has been recieved by ${outletName} recently`
                    }
                })
            })
            .catch(function (error) {
                console.log(error);
            })
    } catch (error) {
        console.log(error);
    }
}