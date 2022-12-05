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
            body("password").notEmpty().isLength({
                min: 8,
                max: 16
            }),
            body("email").notEmpty().isEmail()
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
    ,adminController.loginAdmin);

router.get("/adminData", passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }), adminController.getAdminData);

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
        adminController.editBrand)

module.exports = router;