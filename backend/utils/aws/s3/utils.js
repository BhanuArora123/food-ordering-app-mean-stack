var aws = require("../init").getAwsSdk();

var s3 = new aws.S3();

exports.uploadFileToS3 = function (file, cb) {
    var base64Image = new Buffer.from(file.data, 'base64');
    try {
        s3.upload({
            Bucket: process.env.IMAGE_BUCKET,
            Key: (Date.now() + "_" + file.name),
            Body: base64Image,
            ContentEncoding: 'base64'
        }, function (err, data) {
            if (err) {
                return cb(err);
            }
            return cb(null, data.Location);
        });
    } catch (error) {
        console.log(error);
    }
}