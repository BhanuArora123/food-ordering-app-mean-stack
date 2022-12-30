var router = require("express").Router();
var outletController = require("../controllers/outlets.controller");
var body = require("express-validator").body;
var passport = require("passport");
var validate = require("../middleware/validation.middleware").validate;

router.get("/table/get", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }), outletController.getTables);

router.post("/table/add", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
    [
        body("tableId").notEmpty().isNumeric(),
        body("assignedOrderId").isString().optional()
    ],
    validate
    , outletController.addTable
);

router.put("/edit",
    passport.authenticate("jwt", { failureMessage: "unauthorised!" }),
    [
        body("name").optional().isString()
    ],
    outletController.editOutlet
);

router.delete("/delete",passport.authenticate("jwt", { failureMessage: "unauthorised!" }),outletController.removeOutlet);

router.get("/users/get",passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),outletController.getOutletUsers)

router.get("/getAll", passport.authenticate("jwt", { session: false }), outletController.getAllOutlets);

module.exports = router;