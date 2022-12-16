var mongoose = require("mongoose");

var schema = mongoose.Schema;

var categorySchema = new schema({
    name:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model("category",categorySchema);