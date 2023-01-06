require("dotenv").config("../.env");

module.exports = {
    // db
    dbURI : process.env.DB_URL,
    //jwt 
    authSecret:process.env.AUTH_SECRET,
    // sendgrid 
    sendGridKey:process.env.SENDGRID_API_KEY,
    emailUserName : process.env.EMAIL_USERNAME,
    //aws
    awsSecretKey:process.env.AWS_SECRET_ACCESSKEY,
    awskeyId:process.env.ACCESS_KEY_ID,
    awsRegion:process.env.REGION,
    awsSignatureVersion:process.env.SIGNATURE_VERSION,
    imageBucketName:process.env.IMAGE_BUCKET,
    awsAccountId:process.env.ACCOUNT_ID
}