var router = require("express").Router();

var body = require("express-validator").body;
var passport = require("passport");
var categoryController = require("../controllers/category.controller");
var validate = require("../middleware/validation.middleware").validate;

router.post("/create",
    passport.authenticate("jwt", { session: false }),
    [
        body("category").notEmpty().isLength({
            min: 3
        }).isString()
    ],
    validate,
    categoryController.createCategory);

router.get("/get", passport.authenticate("jwt", { session: false }), categoryController.getAllCategories);

router.post("/sub/create",
    passport.authenticate("jwt", { session: false }), [
    body("subCategoryName").notEmpty().isLength({
        min: 3
    }).isString(),
    body("category").notEmpty().isString()
],
    validate,
    categoryController.createSubCategory);

router.get("/sub/get", passport.authenticate("jwt", { session: false }), categoryController.getSubCategories);

router.get("/availableCategories",passport.authenticate("jwt", { session: false }), categoryController.getCategoriesForBrand);

module.exports = router;