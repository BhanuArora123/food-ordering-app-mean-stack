var router = require("express").Router();

var passport = require("passport");
var adminController = require("../controllers/admin.controller");

var body = require("express-validator").body;

var validate = require("../middleware/validation.middleware").validate;

router
    .post("/register",
        passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
        [
            body("name").notEmpty().isString(),
            body("password").optional().isLength({
                min: 8,
                max: 16
            }),
            body("email").notEmpty().isEmail(),
            body("role").optional().isString(),
            body("permissions").notEmpty().isArray(),
            body("permission.*.permissionId").notEmpty().isString(),
            body("permissions.*.permissionName").notEmpty().isString()
        ],
        validate,
        adminController.registerAdmin);

router.post("/login",
    [
        body("password").notEmpty().isLength({
            min: 8,
            max: 16
        }),
        body("email").notEmpty().isEmail()
    ]
    , validate
    , adminController.loginAdmin);

router.get("/adminData", passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }), adminController.getAdminData);

router.get("/get/all", passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }), adminController.getAllAdmins);

router.put("/updatePassword",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("currentPassword").isLength({
            min: 6,
            max: 16
        }),
        body("oldPassword").isLength({
            min: 6,
            max: 16
        })
    ],
    validate,
    adminController.updatePassword);

router.get("/brand/getAll", passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }), adminController.getAllBrands)

router
    .put("/brand/edit",
        passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
        [
            body("name").optional().isString(),
            body("email").optional().isEmail(),
            body("isDisabled").optional().isBoolean(),
            body("brandId").notEmpty().isString()
        ],
        validate,
        adminController.editBrand
    )

// permissions 

router.get("/permissions/get",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    adminController.getPermissions
)

router.put("/permissions/edit",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("adminId").notEmpty().isString(),
        body("permissions").notEmpty().isArray(),
        body("permission.*.permissionId").notEmpty().isString(),
        body("permissions.*.permissionName").notEmpty().isString()
    ],
    adminController.editPermissions
)
module.exports = router;