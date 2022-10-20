var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

const outletSchema = new schema({
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
    rating:{
        type:Number,
        default:0
    },
    ratingCount:{
        type:Number,
        default:0
    },
    createdBy:{
        type:ObjectId
    }
},{
    timestamps:true
});

module.exports = mongoose.model("outlet",outletSchema);