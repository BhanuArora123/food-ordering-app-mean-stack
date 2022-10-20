var router = require("express").Router();

// var passport = require("passport");
var outletController = require("../controllers/outlets.controller");

router.post("/register", outletController.registerOutlet);
router.post("/login", outletController.loginOutlet);

module.exports = router;