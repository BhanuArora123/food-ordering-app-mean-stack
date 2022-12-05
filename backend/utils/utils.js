var bcrypt = require("bcryptjs");
var adminModel = require("../models/admin.model");
const brandsModel = require("../models/brands.model");

var outletsModel = require("../models/outlets.model");

var throwError = require("../utils/errors");

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