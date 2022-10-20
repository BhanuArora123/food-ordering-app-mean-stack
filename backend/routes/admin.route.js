var router = require("express").Router();

// var passport = require("passport");
var adminController = require("../controllers/admin.controller");

router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

module.exports = router;