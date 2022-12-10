
var async = require("async");
var server = require("socket.io").Server;
var socketAuth = require("../middleware/socket.authentication");
var socketInstance;

exports.connectSocket = function (app) {
    var socketConnection = new server(app,{
        cors:{
            origin:"*"
        }
    });

    // socket authentication

    socketConnection.use(socketAuth);
    
    // socket connection estabhishment 

    async.waterfall([
        function (cb) {
            // socket connection config
            socketConnection.on("connection",function (socket) {
                cb(socket);
            })
            socketConnection.on("error",function (error) {
                cb(error);
            })
        }
    ],function (error,socket) {
        if(error){
            console.log(error);
            process.exit(-1);
        }
        socketInstance = socket;
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