var router = require("express").Router();
var passport = require("passport");
var reportsController = require("../controllers/reports.controller");
var query = require("express-validator").query;
var validate = require("../middleware/validation.middleware").validate;

router
    .get("/itemsSoldCount",
        passport.authenticate("jwt", { session: false, failureMessage: "unauthorised!" }),
        [
            query("startDate").notEmpty().isString(),
            query("endDate").notEmpty().isString(),
            query("timezone").notEmpty().isString(),
            query("selectedFoodItems").notEmpty().isString(),
            query("brandId").notEmpty().isString(),
            query("outletId").optional().isString(),
        ],
        validate,
        reportsController.getAllItemsSoldCountHourly
    );
router
    .get("/brandRevenue",
        passport.authenticate("jwt", { session: false, failureMessage: "unauthorised!" }),
        [
            query("startDate").notEmpty().isString(),
            query("endDate").notEmpty().isString(),
            query("brandIds").notEmpty().isString()
        ],
        validate,
        reportsController.getBrandRevenue
    );
router
    .get("/topMaxSoldItem",
        passport.authenticate("jwt", { session: false, failureMessage: "unauthorised!" }),
        [
            query("startDate").notEmpty().isString(),
            query("endDate").notEmpty().isString(),
            query("timezone").notEmpty().isString(),
            query("startHour").notEmpty().isString(),
            query("brandId").notEmpty().isString(),
            query("requiredSoldItemCount").optional().isNumeric(),
        ],
        validate,
        reportsController.getMaxSoldItem
    );

module.exports = router;