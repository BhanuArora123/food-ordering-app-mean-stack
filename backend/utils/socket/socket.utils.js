
var async = require("async");
var socket = require("socket.io").Server;
// var socketAuth = require("../../middleware/socket.authentication");
var socketInstance;

exports.connectSocket = function (app) {
    var socketConnection = new socket(app,{
        cors:{
            origin:"*"
        }
    });

    // socket authentication

    // socketConnection.use(socketAuth);
    
    // socket connection estabhishment 

    // socket connection config
    socketConnection.on("connection",function (socket) {
        socketInstance = socketConnection;
        console.log("client connected");

        socket.on("connectOutlet",function (data) {
            socket.join(data.brandId);
            console.log(data.brandId);
        })

        socket.on("customerJoined",function (customerId) {
            socket.join(customerId);
        })

    })
    socketConnection.on("error",function (error) {
        console.log(error);
    })
}

exports.getSocketInstance = function () {
    try {
        if(!socketInstance){
            throw new Error("socket isn't connected yet!");
        }
        return socketInstance;
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }
}

var emitSocketEvent = function (socketInstance,eventName,eventData) {
    try {
        socketInstance.emit(eventName,eventData);
    } catch (error) {
        console.log(error);
    }
}

var recieveSocketEvent = function (socketInstance,eventName,eventCallback) {
    try {
        socketInstance.on(eventName,eventCallback);
    } catch (error) {
        console.log(error);
    }
}