var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new schema({
    userId:{
        type:ObjectId,
        required:true,
        ref:"user"
    },
    // one to few relationship - preferring embedding
    cartItems:[
        {
            foodItemId:{
                type:ObjectId,
                required:true,
                ref:"food"
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ],
    outletId:{
        type:ObjectId,
        required:true,
        ref:"outlet"
    }
});

module.exports = mongoose.model("cart",cartSchema);