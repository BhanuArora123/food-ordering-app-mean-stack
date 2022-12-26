var router = require("express").Router();

var passport = require("passport");
var usersController = require("../controllers/users.controller");

var body = require("express-validator").body;

var validate = require("../middleware/validation.middleware").validate;

router
    .post("/register",
        [
            body("name").notEmpty().isString(),
            body("password").optional().isLength({
                min: 8,
                max: 16
            }),
            body("email").notEmpty().isEmail(),
            body("role.name").notEmpty().isString(),
            body("role.subRole.*").notEmpty().isString(),
            body("brand._id").optional().isString(),
            body("brand.name").optional().isString(),
            body("outlet._id").optional().isString(),
            body("outlet.name").optional().isString(),
            body("permission.*.permissionId").notEmpty().isString(),
            body("permissions.*.permissionName").notEmpty().isString()
        ],
        validate,
        usersController.registerUser);

router.post("/login",
    [
        body("password").notEmpty().isLength({
            min: 8,
            max: 16
        }),
        body("email").notEmpty().isEmail()
    ]
    , validate
    , usersController.loginUser);

router.get("/profile", passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }), usersController.getUserData);

router.get("/admin/all", passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }), usersController.getAllAdmins);

router.get("/admin/count",usersController.getAdminCount);

router.put("/updatePassword",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("currentPassword").isLength({
            min: 6,
            max: 16
        }),
        body("newPassword").isLength({
            min: 6,
            max: 16
        }),
        body("userId").notEmpty().isString()
    ],
    validate,
    usersController.updatePassword);

router.put("/permissions/edit",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("adminId").notEmpty().isString(),
        body("permissions").notEmpty().isArray(),
        body("currentUserRole.name").notEmpty().isString(),
        body("currentUserRole.subRole.*").notEmpty().isString(),
        body("role.name").notEmpty().isString(),
        body("role.subRole.*").notEmpty().isString(),
        body("permission.*.permissionId").notEmpty().isString(),
        body("permissions.*.permissionName").notEmpty().isString()
    ],
    usersController.editPermissions
)
module.exports = router;