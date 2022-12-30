var mongoose = require("mongoose");

var schema = mongoose.Schema;

var brandsSchema = new schema({
    name:{
        type:String,
        required:true
    },
    admin:{
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        }
    },
    isDisabled:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

module.exports = mongoose.model("brands",brandsSchema);