const express = require("express");

const router = express.Router();

const foodController = require("../controllers/food.controller");

var fileUploader = require("../utils/uploadFile").getFileUploader("public",["image/jpg","image/png","image/jpeg"]);

router.get("/getFoodItems",foodController.displayFoodItem);
router.post("/addFoodItem",fileUploader.single("foodImage"),foodController.addOrEditFoodItem);
router.post("/editFoodItem",foodController.addOrEditFoodItem);
router.delete("/removeFoodItem",foodController.deleteFoodItem);

module.exports = router;