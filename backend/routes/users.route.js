var router = require("express").Router();

// var passport = require("passport");
var userController = require("../controllers/users.controller");
var passport = require("passport");

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/userData", passport.authenticate("jwt", { failureMessage: "unauthorized!",session:false }), userController.getUserData);

router.put("/addToCart",passport.authenticate("jwt", { failureMessage: "unauthorized!",session:false }), userController.addToCart);

router.put("/removeFromCart",passport.authenticate("jwt", { failureMessage: "unauthorized!",session:false }),userController.removeFromCart);

module.exports = router;