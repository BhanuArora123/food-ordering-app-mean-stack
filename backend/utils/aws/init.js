var aws = require("aws-sdk");

var config = require("../../config/config");

aws.config.update({
    secretAccessKey: config.awsSecretKey,
    accessKeyId: config.awskeyId,
    region: config.awsRegion,
    signatureVersion: config.awsSignatureVersion,
});

module.exports = {
    getAwsSdk : function () {
        return aws;
    }
}