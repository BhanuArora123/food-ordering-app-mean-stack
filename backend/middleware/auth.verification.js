var passportJwt = require("passport-jwt");

var admin = require("../models/admin.model");
var outlets = require("../models/outlets.model");
var brands = require("../models/brands.model");

var JwtStrategy = passportJwt.Strategy;

var ExtractStrategy = passportJwt.ExtractJwt;

exports.applyJwtStrategy = function () {
    var options = {
        jwtFromRequest: ExtractStrategy.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.AUTH_SECRET
    };
    return new JwtStrategy(options, function (jwtPayload, done) {
        var email = jwtPayload.email;
        var isUserFound = false;
        admin.findOne({
            email: email
        })
            .then(function (adminData) {
                if (adminData) {
                    isUserFound = true;
                    return done(null, {
                        email: email,
                        userId: adminData._id,
                        role: adminData.role,
                        permissions:adminData.permissions
                    });
                }
                return brands.findOne({
                    email: email
                });
            })
            .then(function (brandData) {
                if (isUserFound) {
                    return;
                }
                if (brandData && !(brandData.isDisabled)) {
                    isUserFound = true;
                    return done(null, {
                        email: email,
                        userId: brandData._id,
                        role: "brand",
                        permissions:brandData.permissions
                    });
                }
                return outlets.findOne({
                    email: email
                })
            })
            .then(function (outletData) {
                if (isUserFound) {
                    return;
                }
                if (outletData) {
                    return done(null, {
                        email: email,
                        userId: outletData._id,
                        role:"outlet",
                        brandId:outletData.brand.id.toString(),
                        permissions:outletData.permissions
                    });
                }
                done(null, false);
            })
            .catch(function (error) {
                done(error, false);
            })
    })
}

// debouncing, images upload to s3, sqs server,mem cache d, redis node package and uses ,cdn , order by sqs , polling in socket ,fallbacks ,projection ,cursor 