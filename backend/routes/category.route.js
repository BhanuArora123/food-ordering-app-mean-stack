var router = require("express").Router();

var passport = require("passport");
var categoryController = require("../controllers/category.controller");

router.post("/create",passport.authenticate("jwt",{session: false}),categoryController.createCategory);

router.get("/get",passport.authenticate("jwt",{session: false}),categoryController.getAllCategories);

router.post("/sub/create",passport.authenticate("jwt",{session: false}),categoryController.createSubCategory);

router.get("/sub/get",passport.authenticate("jwt",{session: false}),categoryController.getSubCategories);

module.exports = router;