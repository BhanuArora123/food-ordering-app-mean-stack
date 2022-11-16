var router = require("express").Router();

var passport = require("passport");
var adminController = require("../controllers/admin.controller");

router.post("/register",passport.authenticate("jwt",{failureMessage:"unauthorised!",session:false }), adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/adminData",passport.authenticate("jwt",{failureMessage:"unauthorised!",session:false }),adminController.getAdminData)

module.exports = router;