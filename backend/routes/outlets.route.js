var router = require("express").Router();

var passport = require("passport");
var outletController = require("../controllers/outlets.controller");

router.post("/register", passport.authenticate("jwt", { session: false }), outletController.registerOutlet);
router.post("/login", outletController.loginOutlet);
router.get("/outletData", passport.authenticate("jwt", { session: false }), outletController.getOutletData);
router.get("/getAllOrders", passport.authenticate("jwt", { session: false }), outletController.getAllOrders);

module.exports = router;