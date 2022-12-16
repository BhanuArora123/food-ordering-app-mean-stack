var mongoose = require("mongoose");

var schema = mongoose.Schema;

var taxSchema = new schema({
    name:{
        type:String,
        required:true
    },
    percentageRange:{
        lowerBound:{
            type:Number,
            default:0
        },
        upperBound:{
            type:Number,
            default:100
        }
    }
},{
    timestamps:true
});

module.exports = {
    model:mongoose.model("taxes",taxSchema),
    schema:taxSchema
}