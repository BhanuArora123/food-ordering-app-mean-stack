var aws = require("../init").getAwsSdk();

var config = require("../../../config/config");

var sqs = new aws.SQS({
    apiVersion: '2012-11-05',
    region: config.awsRegion
});

var consumer = require("sqs-consumer").Consumer;

var async = require("async");

var createTaskQueue = function (queueName, processNextTask) {
    try {
        var queueParams = {
            QueueName: queueName
        };
        async.waterfall([
            function (cb) {
                sqs.getQueueUrl(queueParams, function (err, data) {
                    if (err) {
                        if (err.code === "AWS.SimpleQueueService.NonExistentQueue") {
                            return cb(null, true);
                        }
                        return cb(err);
                    }
                    return cb(null, false);
                })
            },
            function (createQueue, cb) {
                if (!createQueue) {
                    return cb();
                }
                sqs.createQueue(queueParams, function (err, data) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, data);
                })
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
                return processNextTask(err);
            }
            console.log(result);
            return processNextTask();
        })

    } catch (error) {
        console.log(error);
    }
}

var addTaskToQueue = function (queueName, params) {
    try {
        var taskParams = {
            QueueUrl: `https://sqs.us-east-1.amazonaws.com/${config.awsAccountId}/${queueName}`,
            MessageBody: JSON.stringify(params.MessageBody)
        }
        sqs.sendMessage(taskParams, function (err, data) {
            if (err) {
                console.log(params);
                console.log(err);
            } else {
                console.log("message successfully added", data.MessageId);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

var processTask = function (queueName, worker, processNextTask) {
    try {

        var taskConsumer = consumer.create({
            queueUrl: `https://sqs.us-east-1.amazonaws.com/${config.awsAccountId}/${queueName}`,
            handleMessage: function (data) {
                worker(data);
            },
            visibilityTimeout:30,
            ReceiveMessageWaitTimeSeconds:20
        });

        taskConsumer.on('error', function(err) {
            console.error(err);
        });

        // starting consumer
        taskConsumer.start();
        processNextTask();

    } catch (error) {
        console.log(error.message);
        processNextTask(error);
    }
}

module.exports = {
    processTask: processTask,
    addTaskToQueue: addTaskToQueue,
    createTaskQueue: createTaskQueue
}