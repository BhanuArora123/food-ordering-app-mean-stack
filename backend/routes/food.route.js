var express = require("express");
var passport = require("passport");

var router = express.Router();

var foodController = require("../controllers/food.controller");

var body = require("express-validator").body;
var query = require("express-validator").query;

var fileUpload = require("express-fileupload");
var validate = require("../middleware/validation.middleware").validate;

router.get("/getFoodItems",
[
    query("brandId").optional().isString(),
    query("minPrice").optional().isNumeric(),
    query("maxPrice").optional().isNumeric(),
    query("minRating").optional().isNumeric(),
    query("isVeg").optional().isBoolean(),
    query("foodName").optional().isString(),
    query("subCategory").optional().isString(),
    query("category").optional().isString(),
    query("page").notEmpty().isNumeric(),
    query("limit").notEmpty().isNumeric()
],
validate,
 foodController.displayFoodItem);
router.post("/addFoodItem",
    passport.authenticate("jwt", { failureMessage: false, session: false }),
    fileUpload({
        useTempFiles: false,
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
        body("category.name").notEmpty().isString(),
        body("category.id").notEmpty().isString(),
        body("category.subCategory.name").notEmpty().isString(),
        body("category.subCategory.id").notEmpty().isString(),
        body("foodItemId").notEmpty().isString(),
        body("brandId").notEmpty().isString()
    ],
    validate
    , foodController.editFoodItem);
router.delete("/removeFoodItem", passport.authenticate("jwt", { session: false }), foodController.deleteFoodItem);

module.exports = router;