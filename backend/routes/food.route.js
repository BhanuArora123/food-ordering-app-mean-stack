var express = require("express");
var passport = require("passport");

var router = express.Router();

var foodController = require("../controllers/food.controller");

var path = require("path");

var fileUpload = require("express-fileupload");

router.get("/getFoodItems", foodController.displayFoodItem);
router.post("/addFoodItem",
    passport.authenticate("jwt", { failureMessage: false, session: false }),
    fileUpload({
        tempFileDir:path.join(__dirname,"..","public"),
        useTempFiles : true,
    }),
    foodController.addFoodItem);
router.put("/editFoodItem",passport.authenticate("jwt",{session:false}),foodController.editFoodItem);
router.delete("/removeFoodItem",passport.authenticate("jwt",{session:false}),foodController.deleteFoodItem);

module.exports = router;