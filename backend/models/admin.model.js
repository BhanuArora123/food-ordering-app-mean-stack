var mongoose = require("mongoose");

var schema = mongoose.Schema;

var adminSchema = new schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enums:["admin","superAdmin"],
        default:"admin"
    }
});

module.exports = mongoose.model("admin",adminSchema);