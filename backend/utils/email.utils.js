
require("dotenv").config("./env");

var sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = function (emails, subject, content,cb) {
    try {
        var mailConfig = {
            to: emails,
            from: process.env.EMAIL_USERNAME,
            subject: subject,
            text: content
        };

        return sgMail
            .send(mailConfig)
            .then(function (data) {
                console.log(data);
                console.log("email sent!");
                cb(null,data);
            })
            .catch(function (error) {
                console.log(error);
                cb(error);
            })
    } catch (error) {
        console.log(error);
        cb(error);
    }
}