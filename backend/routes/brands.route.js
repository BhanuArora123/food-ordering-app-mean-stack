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
            min:6,
            max:16
        })
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
router.put("/updatePassword",
 passport.authenticate("jwt", { session: false }),
 [
    body("brandId").notEmpty().isString(),
    body("newPassword").isLength({
        min:6,
        max:16
    }),
    body("currentPassword").isLength({
        min:6,
        max:16
    })
 ],
 validate,
  brandsController.updatePassword);

//outlet routes for brand 
router.put("/outlet/edit", passport.authenticate("jwt", { session: false }),[
    
],
validate,
 brandsController.editOutlet);
router.get("/outlet/getAll", passport.authenticate("jwt", { session: false }), brandsController.getAllOutlets);

module.exports = router;