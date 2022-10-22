var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

const foodSchema = new schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    outletId:{
        type:ObjectId,
        required:true
    },
    imageUrl:{
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
    isVeg:{
        type:Boolean,
        default:true
    }
});

module.exports = mongoose.model("food",foodSchema);