

appModule
.service("socketService",function () {
    var socket;
    this.connect = function () {
        socket = io.connect("http://localhost:8080");
        socket.on("connect",function () {
            console.log("socket connected!");
        })
        socket.on("disconnect",function () {
            console.log("socket disconnected!");
        })
    }
    this.emitEvent = function (eventName,eventData) {
        socket.emit(eventName,eventData);
    }
    this.recieveEvent = function (eventName,eventCallback) {
        socket.off(eventName);
        socket.on(eventName,eventCallback);
    }
    this.activeListenersCount = function () {
        return socket.listeners().length;
    }
})