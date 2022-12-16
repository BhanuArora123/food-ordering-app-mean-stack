var router = require("express").Router();

var passport = require("passport");
var brandsController = require("../controllers/brands.controller");
var body = require("express-validator").body;
var validate = require("../middleware/validation.middleware").validate;

router.post("/register",
    passport.authenticate("jwt", { session: false }),
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
    validate,
    brandsController.registerBrand);
router.post("/login",
    [
        body("email").isEmail(),
        body("password").isLength({
            min: 6,
            max: 16
        })
    ],
    validate,
    brandsController.loginBrand);
router.get("/brandData", passport.authenticate("jwt", { session: false }), brandsController.getBrandData);

router
    .post("/sendInstructions",
        passport.authenticate("jwt", { session: false }),
        [
            body("title").notEmpty().isString(),
            body("content").notEmpty().isString()
        ],
        brandsController.sendInstructionsToOutlet)

router.put("/updatePassword",
    passport.authenticate("jwt", { session: false }),
    [
        body("brandId").notEmpty().isString(),
        body("newPassword").isLength({
            min: 6,
            max: 16
        }),
        body("currentPassword").isLength({
            min: 6,
            max: 16
        })
    ],
    validate,
    brandsController.updatePassword);

//outlet routes for brand 
router.put("/outlet/edit", passport.authenticate("jwt", { session: false }), [

],
    validate,
    brandsController.editOutlet);
router.get("/outlet/getAll", passport.authenticate("jwt", { session: false }), brandsController.getAllOutlets);

// permissions
router.get("/permissions/get",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    brandsController.getPermissions
)

router.put("/permissions/edit",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("brandId").notEmpty().isString(),
        body("permissions").notEmpty().isArray(),
        body("permission.*.permissionId").notEmpty().isString(),
        body("permissions.*.permissionName").notEmpty().isString()
    ],
    brandsController.editPermissions
)

module.exports = router;