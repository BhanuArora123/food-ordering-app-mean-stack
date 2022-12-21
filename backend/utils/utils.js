var bcrypt = require("bcryptjs");
var adminModel = require("../models/admin.model");
var brandsModel = require("../models/brands.model");

var outletsModel = require("../models/outlets.model");

var throwError = require("../utils/errors");

var passwordGenerator = require("generate-password");

var moment = require("moment-timezone");

exports.convertToArray = function (obj) {
    return Object.keys(obj).map(function (keys) {
        return obj[keys];
    });
}

exports.updatePassword = function (currentPassword,newPassword,oldPassword,userId,role) {
    bcrypt.compare(currentPassword,oldPassword)
    .then(function (isPasswordCorrect) {
        if(!isPasswordCorrect){
            throwError("incorrect current password!",401);
        }
        return bcrypt.genSalt(12);
    })
    .then(function (salt) {
        return bcrypt.hash(newPassword,salt);
    })
    .then(function (hashedPassword) {

        var modelToUpdate = adminModel;

        if(role === "outlet"){
            modelToUpdate = outletsModel
        }
        else if(role === "brand"){
            modelToUpdate = brandsModel;
        }
        return modelToUpdate.updateOne({
            _id:userId
        },{
            $set:{
                password:hashedPassword
            }
        });
    })
}

exports.genRandomPassword = function () {
    try {
        var password = passwordGenerator.generate({
            length:10,
            numbers:true,
            symbols:true,
            lowercase:true,
            uppercase:true
        });
        return password;
    } catch (error) {
        console.log(error);
    }
}

exports.convertTimezone = function (date,currentTimezone,timezone) {
    try {
        moment.tz.setDefault(currentTimezone);
        var requiredDate = moment(date).tz(timezone).toDate();
        moment.tz.setDefault("UTC");
        return requiredDate;
    } catch (error) {
        console.log(error);
    }
}

exports.setTimeInDate = function (date,currentTimezone,timezone,hour) {
    try {
        var currentDate = exports.convertTimezone(date,currentTimezone,timezone).setHours(hour,0,0,0);
        var requiredDate = exports.convertTimezone(moment(currentDate),currentTimezone,timezone);
        console.log(requiredDate);
        return requiredDate;
    } catch (error) {
        console.log(error);
    }
}