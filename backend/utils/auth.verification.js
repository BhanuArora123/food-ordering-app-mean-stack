var passportJwt = require("passport-jwt");

var users = require("../models/users.model");

var JwtStrategy = passportJwt.Strategy;

var ExtractStrategy = passportJwt.ExtractJwt;

exports.applyJwtStrategy = function () {
    var options = {
        jwtFromRequest: ExtractStrategy.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.AUTH_SECRET
    };
    return new JwtStrategy(options, function (jwtPayload, done) {
        var email = jwtPayload.email;
        users.findOne({
            email: email
        })
            .then(function (userData) {
                if (userData) {
                    return done(null, {
                        email: email,
                        userId: userData._id
                    });
                }
                return done(null, false);
            })
            .catch(function (error) {
                done(error, false);
            })
    })
}