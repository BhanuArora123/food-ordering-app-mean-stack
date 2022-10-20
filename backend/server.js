var express = require("express");
var app = express();
var mongoose = require("mongoose");
var cors = require("cors");
// using .env
require("dotenv").config("./.env");

var jwt = require("jsonwebtoken");
var passport = require("passport");
var applyJwtStrategy = require("./utils/auth.verification").applyJwtStrategy;
passport.use("jwt",applyJwtStrategy());

var userRouter = require("./routes/users.route")(passport);

// middlewares

// cors setup
app.use(cors({
    origin:"*"
}));

// parsing json req.
app.use(express.json());

// parsing form requests
app.use(express.urlencoded());


app.use("/user",userRouter);

// connecting to database
mongoose.connect(process.env.DB_URL)
.then(function (){
    console.log("database connected!");
    app.listen(8080);
    console.log("server running on port 8080...");
})
.catch(function (error) {
    console.log(error);
})
