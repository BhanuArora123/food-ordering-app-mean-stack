var router = require("express").Router();

// var passport = require("passport");
var outletController = require("../controllers/outlets.controller");
var passport = require("passport");

router.post("/register", outletController.registerOutlet);

router.post("/login", outletController.loginOutlet);

router.get("/outletData", passport.authenticate("jwt", { failureMessage: "unauthorized!",session:false }), outletController.getOutletData);

router.put("/addToCart",passport.authenticate("jwt", { failureMessage: "unauthorized!",session:false }), outletController.addToCart);

router.put("/removeFromCart",passport.authenticate("jwt", { failureMessage: "unauthorized!",session:false }),outletController.removeFromCart);

module.exports = router;