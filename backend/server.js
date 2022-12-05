var express = require("express");
var app = express();
var mongoose = require("mongoose");

var blueBird = require("bluebird");

var cors = require("cors");
// using .env
require("dotenv").config("./.env");

var passport = require("passport");

var outletRouter = require("./routes/outlets.route");

var brandRouter = require("./routes/brands.route");

var adminRouter = require("./routes/admin.route");

var foodRouter = require("./routes/food.route");

var orderRouter = require("./routes/orders.route");

var categoryRouter = require("./routes/category.route");

var taxRouter = require("./routes/tax.route");
// passport configuration
var applyJwtStrategy = require("./middleware/auth.verification").applyJwtStrategy();

passport.use("jwt", applyJwtStrategy);

// middlewares

// cors setup
app.use(cors({
    origin: "*"
}));

// serving files statically
app.use("/public", express.static('public'));

// parsing json req.
app.use(express.json());

// parsing form requests
app.use(express.urlencoded());

app.use("/outlet", outletRouter);

app.use("/brand", brandRouter);

app.use("/admin", adminRouter);

app.use("/food", foodRouter);

app.use("/orders", orderRouter);

app.use("/category", categoryRouter);

app.use("/tax", taxRouter);

// mongoose config
mongoose.Promise = blueBird;

// connecting to database
mongoose
    .connect(process.env.DB_URL, {})
    .then(function () {
        console.log("database connected!");
        app.listen(8080);
        console.log("server running on port 8080...");
    })
    .catch(function (error) {
        console.log(error);
    })
