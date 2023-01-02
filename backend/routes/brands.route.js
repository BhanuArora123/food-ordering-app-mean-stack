var router = require("express").Router();

var passport = require("passport");
var brandsController = require("../controllers/brands.controller");
var body = require("express-validator").body;
var validate = require("../middleware/validation.middleware").validate;

router.get("/getAll", passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }), brandsController.getAllBrands)

router.get("/users/get", passport.authenticate("jwt", { failureMessage: "unauthorized!", session: false }), brandsController.getBrandUsers);

router.put("/edit",
    passport.authenticate("jwt", { failureMessage: "unauthorised!", session: false }),
    [
        body("name").optional().isString(),
        body("isDisabled").optional().isBoolean()
    ],
    validate,
    brandsController.editBrand
);

router
    .post("/sendInstructions",
        passport.authenticate("jwt", { session: false }),
        [
            body("title").notEmpty().isString(),
            body("content").notEmpty().isString()
        ],
        validate,
        brandsController.sendInstructionsToOutlet
    )

module.exports = router;