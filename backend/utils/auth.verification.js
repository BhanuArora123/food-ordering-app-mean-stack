var passportJwt = require("passport-jwt");

var admin = require("../models/admin.model");
var users = require("../models/users.model");
var outlets = require("../models/outlets.model");

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
                return outlets.findOne({
                    email: email
                });
            })
            .then(function (outletData) {
                if (isUserFound) {
                    return;
                }
                if (outletData) {
                    isUserFound = true;
                    return done(null, {
                        email: email,
                        userId: outletData._id,
                        role: "outlet"
                    });
                }
                return users.findOne({
                    email: email
                })
            })
            .then(function (userData) {
                if (isUserFound) {
                    return;
                }
                if (userData) {
                    return done(null, {
                        email: email,
                        userId: userData._id,
                    });
                }
                done(null, false);
            })
            .catch(function (error) {
                done(error, false);
            })
    })
}