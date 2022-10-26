
module.exports = function (message,status) {
    throw new Error(message,{
        cause:{
            statusCode:status
        }
    });
}