var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new schema({
    userId:{
        type:ObjectId,
        required:true
    },
    // one to few relationship - preferring embedding
    orderedItems:[
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
    totalPrice:{
        type:Number,
        required:true
    },
    outletId:{
        type:ObjectId,
        required:true
    }
});

module.exports = mongoose.model("order",orderSchema);