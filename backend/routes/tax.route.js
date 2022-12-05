
var router = require("express").Router();

var taxController = require("../controllers/taxes.controller");
var passport = require("passport");

var body = require("express-validator").body;
var validate = require("../middleware/validation.middleware").validate;

router.post("/add",passport.authenticate("jwt",{ session:false }),[
    body("taxName").notEmpty().isString(),
    body("taxPercentageRange.lowerBound").isNumeric().optional(),
    body("taxPercentageRange.upperBound").isNumeric().optional(),
],
validate,
taxController.addTax);

router.get("/get/all",passport.authenticate("jwt",{ session:false }),taxController.getAllTaxes);

module.exports = router;