var bcrypt = require("bcryptjs");

var brandsModel = require("../models/brands.model");

var outletsModel = require("../models/outlets.model");

var users = require("../models/users.model");

var throwError = require("../utils/errors");

var passwordGenerator = require("generate-password");

var moment = require("moment-timezone");

exports.convertToArray = function (obj) {
    return Object.keys(obj).map(function (keys) {
        return obj[keys];
    });
}

exports.updatePassword = function (currentPassword, newPassword, oldPassword, userId) {
    bcrypt.compare(currentPassword, oldPassword)
        .then(function (isPasswordCorrect) {
            if (!isPasswordCorrect) {
                throwError("incorrect current password!", 401);
            }
            return bcrypt.genSalt(12);
        })
        .then(function (salt) {
            return bcrypt.hash(newPassword, salt);
        })
        .then(function (hashedPassword) {

            return users.updateOne({
                _id: userId
            }, {
                $set: {
                    password: hashedPassword
                }
            });
        })
}

exports.genRandomPassword = function () {
    try {
        var password = passwordGenerator.generate({
            length: 10,
            numbers: true,
            symbols: true,
            lowercase: true,
            uppercase: true
        });
        return password;
    } catch (error) {
        console.log(error);
    }
}

exports.convertTimezone = function (date, currentTimezone, timezone) {
    try {
        moment.tz.setDefault(currentTimezone);
        var requiredDate = moment(date).tz(timezone).toDate();
        moment.tz.setDefault("UTC");
        return requiredDate;
    } catch (error) {
        console.log(error);
    }
}

exports.setTimeInDate = function (date, currentTimezone, timezone, hour) {
    try {
        var currentDate = exports.convertTimezone(date, currentTimezone, timezone).setHours(hour, 0, 0, 0);
        var requiredDate = exports.convertTimezone(moment(currentDate), currentTimezone, timezone);
        return requiredDate;
    } catch (error) {
        console.log(error);
    }
}

exports.isUserAuthorized = function (role, permissions, userRole, requiredPermission) {
    try {
        var priority = {
            superAdmin: 3,
            admin: 2,
            brand: 1,
            outlet: 0
        };

        // priority check
        if (priority[role.name] < priority[userRole.name]) {
            return {
                isAuthorized: false,
                message: "unauthorised!"
            }
        }

        if(requiredPermission){
            // permission check 
            var permissionAuthorization = permissions.find(function (permission) {
                return permission.permissionName === requiredPermission;
            })
    
            if (!permissionAuthorization) {
                return {
                    isAuthorized: false,
                    message: "unauthorised!"
                };
            }
        }

        return {
            isAuthorized: true
        }
    } catch (error) {
        console.log(error);
    }
}

exports.registerBrandOrOutlet = function (role, brand, outlet,adminName,adminEmail) {
    try {
        if (role === "brand") {
            return brandsModel.findOne({
                _id: brand.id
            }, {
                id: "$_id",
                name: 1
            })
                .then(function (brandData) {
                    if (brandData) {
                        return brandData;
                    }
                    var newBrand = new brandsModel({
                        name: brand.brandName,
                        admin:{
                            name:adminName,
                            email:adminEmail
                        }
                    });
                    return newBrand
                        .save()
                        .then(function (brandData) {
                            return {
                                id: brandData._id,
                                name: brandData.name
                            }
                        })
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        else if (role === "outlet") {
            return outletsModel.findOne({
                _id: outlet.id
            }, {
                id: "$_id",
                name: 1,
                brand: 1
            })
                .then(function (outletData) {
                    if (outletData) {
                        return outletData;
                    }
                    var newOutlet = new outletsModel({
                        name: outlet.name,
                        brand: outlet.brand,
                        admin:{
                            name:adminName,
                            email:adminEmail
                        }
                    });
                    return newOutlet
                        .save()
                        .then(function (outletData) {
                            return {
                                id: outletData._id,
                                name: outletData.name,
                                brand: outletData.brand
                            }
                        })
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    } catch (error) {
        console.log(error);
    }
}

exports.blockDisabledBrands = function (userData) {
    try {
        if(!userData){
            return false;
        }
        // allowing login only if user has atleast one enabled brand or outlet or is admin
        var enabledBrands , enabledOutlets;
        if(userData && userData.brands){
            enabledBrands = userData.brands.filter(function (brand) {
                return !(brand.isDisabled);
            })
        }
        else if(userData && userData.outlets){
            enabledOutlets = userData.outlets.filter(function (outlet) {
                return !(outlet.brand.isDisabled);
            })
        }
        return (enabledBrands?.length || enabledOutlets?.length || userData.role.name === 'admin' || userData.role.name === 'superAdmin');
    } catch (error) {
        console.log(error);
        return false;
    }
}