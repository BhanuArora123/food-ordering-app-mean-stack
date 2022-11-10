var express = require("express");
var passport = require("passport");

var router = express.Router();

var foodController = require("../controllers/food.controller");

var fileUploader = require("../utils/uploadFile").getFileUploader("public", ["image/jpg", "image/png", "image/jpeg"]);

router.get("/getFoodItems", foodController.displayFoodItem);
router.post("/addFoodItem",
    passport.authenticate("jwt", { failureMessage: false, session: false }),
    //  fileUploader.single("foodImage"),
    foodController.addOrEditFoodItem);
router.post("/editFoodItem", foodController.addOrEditFoodItem);
router.delete("/removeFoodItem", foodController.deleteFoodItem);

module.exports = router;