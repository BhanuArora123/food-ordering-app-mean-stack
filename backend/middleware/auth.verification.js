var passportJwt = require("passport-jwt");

var users = require("../models/users.model");
var customerModel = require("../models/customer.model").model;
var redisUtils = require("../utils/redis/redis.utils");
var utils = require("../utils/utils");
var config = require("../config/config");

var JwtStrategy = passportJwt.Strategy;

var ExtractStrategy = passportJwt.ExtractJwt;

exports.applyJwtStrategy = function () {
    var options = {
        jwtFromRequest: ExtractStrategy.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.authSecret
    };
    return new JwtStrategy(options, function (jwtPayload, done) {
        var email = jwtPayload.email;
        var phoneNumber = jwtPayload.phoneNumber;
        var role = jwtPayload.role;
        var userId = jwtPayload.userId;
        var customerBrandId = jwtPayload.brandId;
        var isRedisResponse;

        // customer authentication
        if (role === 'customer') {
            return redisUtils
                .getValue(`customer_${phoneNumber}_${customerBrandId}`)
                .then(function (customerData) {
                    if (!customerData) {
                        return customerModel
                            .findOne({
                                _id: userId
                            })
                    }
                    isRedisResponse = true;
                    return JSON.parse(customerData);
                })
                .then(function (customerData) {
                    if (customerData) {
                        if (!isRedisResponse) {
                            redisUtils.setValue(customerData._id.toString(), JSON.stringify(customerData._doc));
                        }
                        return done(null, {
                            phoneNumber: phoneNumber,
                            userId: customerData._id,
                            role:"customer"
                        })
                    }
                    done(null, false);
                })
                .catch(function (error) {
                    console.log(error);
                    done(error, false);
                })
        }

        redisUtils
            .getValue(userId)
            .then(function (data) {
                if (!data) {
                    return users.findOne({
                        _id: userId
                    })
                }
                isRedisResponse = true;
                return JSON.parse(data);
            })
            .then(function (userData) {
                if (userData && utils.blockDisabledBrands(userData)) {
                    if (!isRedisResponse) {
                        redisUtils.setValue(userData._id.toString(), JSON.stringify(userData._doc));
                    }
                    return done(null, {
                        email: email,
                        userId: userData._id,
                        role: userData.role,
                        permissions: userData.permissions
                    });
                }
                done(null, false);
            })
            .catch(function (error) {
                done("user is unauthorised or brand is disabled", false);
            })
    })
}

// debouncing, images upload to s3, sqs server,mem cache d, redis node package and uses ,cdn , order by sqs , polling in socket ,fallbacks ,projection ,cursor 