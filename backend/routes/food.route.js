const express = require("express");

const router = express.Router();

const foodController = require("../controllers/food.controller");

router.get("/getFoodItems",foodController.displayFoodItem);
router.post("/addFoodItem",foodController.addOrEditFoodItem);
router.post("/editFoodItem",foodController.addOrEditFoodItem);
router.delete("/removeFoodItem",foodController.deleteFoodItem);

module.exports = router;