
require("dotenv").config("./env");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = function (emails, subject, content) {
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
            })
            .catch(function (error) {
                console.log(error);
            })
    } catch (error) {
        console.log(error);
    }
}