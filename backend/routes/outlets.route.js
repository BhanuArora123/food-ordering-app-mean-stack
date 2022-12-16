var router = require("express").Router();

// var passport = require("passport");
var outletController = require("../controllers/outlets.controller");
var body = require("express-validator").body;
var passport = require("passport");
var validate = require("../middleware/validation.middleware").validate;

router.post("/register",
    [
        body("name").notEmpty().isString(),
        body("email").isEmail(),
        body("password").isLength({
            min: 6,
            max: 16
        }).optional(),
        body("permissions").notEmpty().isArray(),
        body("permission.*.permissionId").notEmpty().isString(),
        body("permissions.*.permissionName").notEmpty().isString()
    ],
    validate
    , outletController.registerOutlet);

router.post("/login",
    [
        body("email").isEmail(),
        body("password").isLength({
            min: 6,
            max: 16
        })
    ],
    validate,
    outletController.loginOutlet);

router.put("/updatePassword",
    passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
    [
        body("currentPassword").isLength({
            min: 6,
            max: 16
        }),
        body("newPassword").isLength({
            min: 6,
            max: 16
        })
    ],
    validate,
    outletController.updatePassword)

router.get("/outletData", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }), outletController.getOutletData);

router.put("/addToCart", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
    [
        body("foodItemName").notEmpty().isString(),
        body("foodItemPrice").notEmpty().isNumeric(),
        body("category").notEmpty().isString(),
        body("subCategory").notEmpty().isString(),
        body("outletName").notEmpty().isString()
    ],
    validate,
    outletController.addToCart);

router.put("/removeFromCart", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
    [
        body("foodItemName").notEmpty().isString(),
    ],
    validate,
    outletController.removeFromCart);

router.get("/table/get", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }), outletController.getTables);

router.post("/table/add", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }),
    [
        body("tableId").notEmpty().isNumeric(),
        body("assignedOrderId").isString().optional()
    ],
    validate
    , outletController.addTable
);

// permissions
router.get("/permissions/get",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    outletController.getPermissions
)

router.put("/permissions/edit",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("outletId").notEmpty().isString(),
        body("permissions").notEmpty().isArray(),
        body("permission.*.permissionId").notEmpty().isString(),
        body("permissions.*.permissionName").notEmpty().isString()
    ],
    outletController.editPermissions
)

module.exports = router;