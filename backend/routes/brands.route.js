var router = require("express").Router();

var passport = require("passport");
var brandsController = require("../controllers/brands.controller");

router.post("/register", passport.authenticate("jwt", { session: false }), brandsController.registerBrand);
router.post("/login", brandsController.loginBrand);
router.get("/brandData", passport.authenticate("jwt", { session: false }), brandsController.getBrandData);

module.exports = router;