var redis = require("redis");

var redisConnection;

// var redis
exports.connectToRedis = function () {
    try {
        redisConnection = redis.createClient();
        redisConnection.connect();
        redisConnection.on("connect",function () {
            console.log("redis connected successfully!");
        })
        redisConnection.on("error",function (error) {
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}

exports.getRedisConnection = function () {
    try {
        return redisConnection;
    } catch (error) {
        console.log(error);
    }
}

exports.setValue = function(key,value){
    try {
        return redisConnection.set(key,value)
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}

exports.getValue = function (key) {
    try {
        return redisConnection.get(key);
    } catch (error) {
        console.log(error);
    }
}

exports.deleteValue = function (key) {
    try {
        return redisConnection.DEL(key);
    } catch (error) {
        console.log(error);
    }
}
exports.storeHashMap = function (key,dataObject) {
    try {
        for (const keyValue in dataObject) {
            var value = dataObject[keyValue];
            if(typeof(value) !== "string" && typeof(value) !== "number"){
                value = JSON.stringify(value);
            }
            redisConnection.hSet(key,keyValue,value);
        }
    } catch (error) {
        console.log(error);
    }
}

exports.getHashMap = function (key) {
    try {
        return redisConnection
        .hGetAll(key)
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}

exports.connectToRedis();