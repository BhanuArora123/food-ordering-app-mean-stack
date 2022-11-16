var mongoose = require("mongoose");

var schema = mongoose.Schema;

var brandsSchema = new schema({
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
    }
},{
    timestamps:true
});

module.exports = mongoose.model("brands",brandsSchema);