
var router = require("express").Router();

var customerController = require("../controllers/customer.controller");
var passport = require("passport");

var body = require("express-validator").body;
var query = require("express-validator").query;
var validate = require("../middleware/validation.middleware").validate;

router.get("/get",
 passport.authenticate("jwt", { session: false }),
 [
    query("phoneNumber").optional().isNumeric(),
    query("brandId").optional().isString()
 ],
 validate,
  customerController.getCustomerData);

router.get("/all/get", 
passport.authenticate("jwt", { session: false }), 
[
    query("brandId").notEmpty().isString(),
    query("page").notEmpty().isNumeric(),
    query("limit").notEmpty().isNumeric()
],
validate,
customerController.getAllCustomers);

router.post("/login",
    [
        body("phoneNumber").isNumeric().notEmpty()
    ],
    validate,
    customerController.login
);

module.exports = router;