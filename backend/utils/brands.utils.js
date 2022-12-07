var emailUtils = require("./email.utils");

var brands = require("../models/brands.model");

var outlet = require("../models/outlets.model");

exports.changeNotificationForOutlets = function (title,content,brandId) {
    try {
        outlet.find({
            "brand.id":brandId
        })
        .then(function (outlets) {
            var outletEmails = outlets.map(function (outletData) {
                return outletData.email;
            })
            return emailUtils.sendEmail(outletEmails,title,content)
        })
        .catch(function (error) {
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
} 