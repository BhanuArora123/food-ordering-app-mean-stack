var sqsUtils = require("./utils");

var workers = require("./workers");

var async = require("async");

require("dotenv").config("../../../.env");

exports.initSqs = function () {
    try {

        async.series([
            function (cb) {
                // defining queues 
                sqsUtils.createTaskQueue("SEND_EMAIL", cb);
            },
            function (cb) {
                // defining queues 
                sqsUtils.createTaskQueue("ORDER_CREATION", cb);
            },
            function (cb) {
                // process queue tasks 
                sqsUtils.processTask("SEND_EMAIL", workers.sendEmailWorker, cb);
            },
            function (cb) {
                // process queue tasks 
                sqsUtils.processTask("ORDER_CREATION", workers.createOrderWorker, cb);
            }
        ],
            function (err, result) {
                if (err) {
                    console.log(err.message);
                }
            })

    } catch (error) {
        console.log(error);
        process.exit(-1);
    }
}