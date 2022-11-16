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
                        role: adminData.role
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
                if (brandData) {
                    isUserFound = true;
                    return done(null, {
                        email: email,
                        userId: brandData._id,
                        role: "brand"
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
                        brandId:outletData.brand.id.toString()
                    });
                }
                done(null, false);
            })
            .catch(function (error) {
                done(error, false);
            })
    })
}