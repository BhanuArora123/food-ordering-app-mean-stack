var express = require("express");
var app = express();
var mongoose = require("mongoose");

var blueBird = require("bluebird");

var cors = require("cors");

var socketUtils = require("./utils/socket/socket.utils");
// using .env
require("dotenv").config("./.env");

var passport = require("passport");

var initSqs = require("./utils/aws/sqs/init").initSqs;

var outletRouter = require("./routes/outlets.route");

var brandRouter = require("./routes/brands.route");

var foodRouter = require("./routes/food.route");

var orderRouter = require("./routes/orders.route");

var categoryRouter = require("./routes/category.route");

var taxRouter = require("./routes/tax.route");

var reportRouter = require("./routes/reports.route");

var customerRouter = require("./routes/customer.route");

var userRouter = require("./routes/users.route");

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

app.use("/food", foodRouter);

app.use("/orders", orderRouter);

app.use("/category", categoryRouter);

app.use("/tax", taxRouter);

app.use("/customer",customerRouter);

app.use("/reports",reportRouter);

app.use("/user",userRouter);

// mongoose config
mongoose.Promise = blueBird;

// connecting to database
mongoose
    .connect(process.env.DB_URL, {})
    .then(function () {
        console.log("database connected!");
        var server = app.listen(8080);
        console.log("server running on port 8080...");
        // io connection 
        socketUtils.connectSocket(server);
        // sqs init 
        initSqs();
    })
    .catch(function (error) {
        console.log(error);
    })
