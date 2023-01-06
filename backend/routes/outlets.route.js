var router = require("express").Router();
var outletController = require("../controllers/outlets.controller");
var body = require("express-validator").body;
var query = require("express-validator").query;
var passport = require("passport");
var validate = require("../middleware/validation.middleware").validate;

router.get("/users/get",
passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
[
    query("brandId").optional().isString(),
    query("subRole").optional().isString(),
    query("page").notEmpty().isNumeric(),
    query("limit").notEmpty().isNumeric(),
    query("outletId").optional().isString(),
],
validate,
outletController.getOutletUsers)

router.get("/getAll", 
passport.authenticate("jwt", { session: false }), 
[
    query("brandId").notEmpty().isString(),
    query("search").optional().isString(),
    query("page").notEmpty().isNumeric(),
    query("limit").notEmpty().isNumeric()
],
validate,
outletController.getAllOutlets);

router.put("/edit",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("name").optional().isString(),
        body("isDisabled").optional().isBoolean()
    ],
    outletController.editOutlet
);

router.get("/table/get", 
passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
[
    query("isAssigned").optional().isBoolean(),
    query("page").notEmpty().isNumeric(),
    query("limit").notEmpty().isNumeric(),
    query("outletId").notEmpty().isString(),
],
validate,
 outletController.getTables);

router.post("/table/add", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
    [
        body("tableId").notEmpty().isNumeric(),
        body("assignedOrderId").isString().optional()
    ],
    validate
    , outletController.addTable
);
module.exports = router;