
var router = require("express").Router();

var customerController = require("../controllers/customer.controller");
var passport = require("passport");

var body = require("express-validator").body;
var validate = require("../middleware/validation.middleware").validate;

router.get("/get/:phoneNumber",passport.authenticate("jwt",{session:false}),customerController.getCustomerData);

module.exports = router;