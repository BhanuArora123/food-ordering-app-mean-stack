var passportJwt = require("passport-jwt");

var users = require("../models/users.model");
var customerModel = require("../models/customer.model").model;
var redisUtils = require("../utils/redis/redis.utils");

var JwtStrategy = passportJwt.Strategy;

var ExtractStrategy = passportJwt.ExtractJwt;

exports.applyJwtStrategy = function () {
    var options = {
        jwtFromRequest: ExtractStrategy.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.AUTH_SECRET
    };
    return new JwtStrategy(options, function (jwtPayload, done) {
        var email = jwtPayload.email;
        var phoneNumber = jwtPayload.phoneNumber;
        var role = jwtPayload.role;
        var userId = jwtPayload.userId;
        var isRedisResponse;

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
                if (userData) {
                    return done(null, {
                        email: email,
                        userId: userData._id,
                        role: userData.role,
                        permissions: userData.permissions
                    });
                }
                if (!isRedisResponse) {
                    redisUtils.setValue(userData._id, JSON.stringify(userData._doc));
                }
                done(null, false);
            })
            .catch(function (error) {
                done(error, false);
            })

        // redisUtils
        //     .getValue(`customer-${phoneNumber}`)
        //     .then(function (customerData) {
        //         if (!customerData) {
        //             return customerModel.findOne({
        //                 phoneNumber: phoneNumber
        //             })
        //         }
        //         isRedisResponse = true;
        //         return JSON.parse(customerData);
        //     })
        //     .then(function (customerData) {
        //         if (customerData) {
        //             if(!isRedisResponse){
        //                 redisUtils.setValue(`customer-${phoneNumber}`,JSON.stringify(customerData));
        //             }
        //             return done(null, {
        //                 phoneNumber: phoneNumber,
        //                 userId: customerData._id
        //             })
        //         }
        //         done(null, false);
        //     })
        //     .catch(function (error) {
        //         done(error, false);
        //     })
    })
}

// debouncing, images upload to s3, sqs server,mem cache d, redis node package and uses ,cdn , order by sqs , polling in socket ,fallbacks ,projection ,cursor 