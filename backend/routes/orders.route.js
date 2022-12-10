var express = require("express");

var router = express.Router();

var passport = require("passport");

var body = require("express-validator").body;

var validate = require("../middleware/validation.middleware").validate;

var ordersController = require("../controllers/orders.controller");

router.get("/getAllOrders", passport.authenticate("jwt", { session: false }), ordersController.getAllOrders);

router.post("/placeOrder",passport.authenticate("jwt",{session:false}),
[
    body("customer.customer.name").notEmpty().isString(),
    body("customer.customer.phoneNumber").notEmpty().isNumeric(),
    body("customer.paidVia").notEmpty().isString(),
    body("brand.id").notEmpty().isString(),
    body("brand.name").notEmpty().isString(),
    body("outlet.id").notEmpty().isString(),
    body("outlet.name").notEmpty().isString(),
    body("orderType").isString().optional(),
    body("assignedTable").isNumeric().optional()
],
validate
,ordersController.placeOrder);

router.put("/changeStatus",passport.authenticate("jwt",{session:false}),
[
    body("orderId").notEmpty().isString(),
    body("status").notEmpty().isString()
],
validate,
ordersController.changeStatus);

router.put("/edit",passport.authenticate("jwt",{session:false}),
[
    body("orderId").notEmpty().isString(),
    body("orderedItems").isArray(),
    body("tableToAssign").isNumeric(),

],
validate,
ordersController.editOrder);

module.exports = router;