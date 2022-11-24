var router = require("express").Router();

var passport = require("passport");
var brandsController = require("../controllers/brands.controller");

router.post("/register", passport.authenticate("jwt", { session: false }), brandsController.registerBrand);
router.post("/login", brandsController.loginBrand);
router.get("/brandData", passport.authenticate("jwt", { session: false }), brandsController.getBrandData);

//outlet routes for brand 
router.put("/outlet/edit/:id",passport.authenticate("jwt",{ session:false }),brandsController.editOutlet);
router.get("/outlet/getAll",passport.authenticate("jwt",{ session:false }));

module.exports = router;