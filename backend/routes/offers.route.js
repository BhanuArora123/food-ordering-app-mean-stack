var express = require("express");
var passport = require("passport");

var router = express.Router();

var offersController = require("../controllers/offers.controller");

var body = require("express-validator").body;
var query = require("express-validator").query;

var validate = require("../middleware/validation.middleware").validate;

router.post("/create",
    passport.authenticate("jwt", { session: false }),
    [

    ],
    validate,
    offersController.createOffer
);

router.post("/applyCoupon",
    passport.authenticate("jwt", { session: false }),
    [

    ],
    validate,
    offersController.applyOffer);

router.get("/get",
    passport.authenticate("jwt", { session: false }),
    [

    ],
    validate,
    offersController.getOffersForBrand);

router.get("/applicableOffers",
    passport.authenticate("jwt", { session: false }),
    [

    ],
    validate,
    offersController.getAllApplicableOffers);

router.put("/edit",
    passport.authenticate("jwt", { session: false }),
    [

    ],
    validate,
    offersController.editOffer);

router.delete("/delete",
    passport.authenticate("jwt", { session: false }),
    [

    ],
    validate,
    offersController.deleteOffer);

module.exports = router;