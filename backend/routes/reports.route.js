var router = require("express").Router();
var passport = require("passport");
var reportsController = require("../controllers/reports.controller");

router
    .get("/itemsSoldCount",
        passport.authenticate("jwt", { session: false, failureMessage: "unauthorised!" }),
        reportsController.getAllItemsSoldCountHourly
    );
router
    .get("/brandRevenue",
        passport.authenticate("jwt", { session: false, failureMessage: "unauthorised!" }),
        reportsController.getBrandRevenue
    );
router
    .get("/topMaxSoldItem",
        passport.authenticate("jwt", { session: false, failureMessage: "unauthorised!" }),
        reportsController.getMaxSoldItem
    );

module.exports = router;