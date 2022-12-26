var router = require("express").Router();

// var passport = require("passport");
var outletController = require("../controllers/outlets.controller");
var body = require("express-validator").body;
var passport = require("passport");
var validate = require("../middleware/validation.middleware").validate;

// router.get("/outletData", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }), outletController.getOutletData);

router.get("/table/get", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }), outletController.getTables);

router.post("/table/add", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
    [
        body("tableId").notEmpty().isNumeric(),
        body("assignedOrderId").isString().optional()
    ],
    validate
    , outletController.addTable
);

router.get("/users/get",passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),outletController.getOutletUsers)

// // permissions
// router.get("/permissions/get",
//     passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
//     outletController.getPermissions
// )

// router.put("/permissions/edit",
//     passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
//     [
//         body("outletId").notEmpty().isString(),
//         body("permissions").notEmpty().isArray(),
//         body("permission.*.permissionId").notEmpty().isString(),
//         body("permissions.*.permissionName").notEmpty().isString()
//     ],
//     outletController.editPermissions
// )

router.get("/getAll", passport.authenticate("jwt", { session: false }), outletController.getAllOutlets);

module.exports = router;