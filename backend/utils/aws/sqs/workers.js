var sendEmail = require("../../email.utils").sendEmail;

exports.sendEmailWorker = function (messageData,cb) {
    try {
        var messageConfig = JSON.parse(messageData.Body);
        sendEmail(messageConfig.email,messageConfig.subject,messageConfig.content,cb);
    } catch (error) {
        console.log(error);
    }
}