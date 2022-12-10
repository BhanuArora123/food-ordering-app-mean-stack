var jwt = require("jsonwebtoken");
exports.socketAuth = function (socket,next) {
    try {
        var token = socket.handshake.auth.token;
        var jwtPayload = jwt.verify(token,process.env.AUTH_SECRET);
        socket.phoneNumber = jwtPayload.phoneNumber;
        next();
    } catch (error) {
        console.log(error);
        next(new Error(error.message));
    }
}