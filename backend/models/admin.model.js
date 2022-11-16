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
        enums:["superAdmin"],
        default:"superAdmin"
    }
});

module.exports = mongoose.model("admin",adminSchema);