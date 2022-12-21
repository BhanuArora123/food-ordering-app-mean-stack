
var router = require("express").Router();

var customerController = require("../controllers/customer.controller");
var passport = require("passport");

var body = require("express-validator").body;
var validate = require("../middleware/validation.middleware").validate;

router.get("/get", passport.authenticate("jwt", { session: false }), customerController.getCustomerData);

router.get("/all/get", passport.authenticate("jwt", { session: false }), customerController.getAllCustomers);

router.post("/login",
    [
        body("phoneNumber").isNumeric().notEmpty()
    ],
    customerController.login
);

module.exports = router;