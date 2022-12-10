var aws = require("aws-sdk");

require("dotenv").config("../../.env");

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
    accessKeyId: process.env.ACCESS_KEY_ID,
    region: process.env.REGION,
    signatureVersion: process.env.SIGNATURE_VERSION,
});

module.exports = {
    getAwsSdk : function () {
        return aws;
    }
}