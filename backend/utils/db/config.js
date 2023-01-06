var mongoose = require("mongoose");

var config = require("../../config/config");

exports.connectDB = function () {
    try {
        return mongoose
            .connect(config.dbURI)
            .then(function (result) {
                return result;
            })
            .catch(function (error) {
                console.log(error);
                process.exit(-1);
            })

    } catch (error) {
        console.log(error);
        process.exit(-1);
    }
}