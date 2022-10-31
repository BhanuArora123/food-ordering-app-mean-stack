var router = require("express").Router();

var passport = require("passport");
var outletController = require("../controllers/outlets.controller");

router.post("/register",passport.authenticate("jwt",{failureMessage:false,session:false }), outletController.registerOutlet);
router.post("/login", outletController.loginOutlet);
router.get("/outletData",passport.authenticate("jwt",{failureMessage:false,session:false }),outletController.getOutletData);

module.exports = router;