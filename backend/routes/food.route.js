var express = require("express");
var passport = require("passport");

var router = express.Router();

var foodController = require("../controllers/food.controller");

var body = require("express-validator").body;

var path = require("path");

var fileUpload = require("express-fileupload");
var validate = require("../middleware/validation.middleware").validate;

router.get("/getFoodItems", foodController.displayFoodItem);
router.post("/addFoodItem",
    passport.authenticate("jwt", { failureMessage: false, session: false }),
    fileUpload({
        tempFileDir: path.join(__dirname, "..", "public"),
        useTempFiles: true,
    }),
    [
        body("foodName").notEmpty().isString(),
        body("foodPrice").isNumeric(),
        body("foodDesc").notEmpty().isString(),
        body("category").notEmpty().isString(),
        body("subCategory").notEmpty().isString(),
        body("isVeg").isBoolean(),
        body("brand").custom(function (value) {
            var brandData = JSON.parse(value);
            return brandData.id && brandData.name;
        })
    ],
    validate,
    foodController.addFoodItem);
router.put("/editFoodItem", passport.authenticate("jwt", { session: false }),
    [
        body("foodName").isString().optional(),
        body("foodPrice").isNumeric().optional(),
        body("foodDesc").isString().optional(),
        body("category").isString().optional(),
        body("subCategory").isString().optional(),
        body("foodItemId").notEmpty().isString()
    ],
    validate
    , foodController.editFoodItem);
router.delete("/removeFoodItem", passport.authenticate("jwt", { session: false }), foodController.deleteFoodItem);

module.exports = router;