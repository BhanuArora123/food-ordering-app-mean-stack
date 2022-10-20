var router = require("express").Router();

// var passport = require("passport");
var userController = require("../controllers/users.controller");

function userRouter(passport) {
    router.post("/register", userController.registerUser);
    router.post("/login", userController.loginUser);
    router.get("/userData", passport.authenticate("jwt", { failureMessage: "unauthorized!",session:false }), userController.getUserData);
    return router;
}

module.exports = userRouter;