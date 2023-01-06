
var config = require("../config/config");

var sgMail = require('@sendgrid/mail')
sgMail.setApiKey(config.sendGridKey);

exports.sendEmail = function (emails, subject, content) {
    try {
        var mailConfig = {
            to: emails,
            from: config.emailUserName,
            subject: subject,
            text: content
        };

        return sgMail
            .send(mailConfig)
            .then(function (data) {
                console.log(data);
                console.log("email sent!");
            })
            .catch(function (error) {
                console.log(error);
            })
    } catch (error) {
        console.log(error);
    }
}