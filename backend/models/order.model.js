var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var ordersSchema = new schema({
    userId:{
        type:ObjectId,
        required:true
    },
    orderedItems : [
        {
            foodName:{
                type:String,
                required:true,
            },
            foodPrice:{
                type:Number,
                required:true
            },
            quantity:{
                type:Number,
                default:1
            },
            category:{
                type:String,
                required:true
            },
            subCategory:{
                type:String,
                required:true
            }
        }
    ],
    amountPaid:{
        type:Number,
        default:0
    },
    createdAt:{
        type: Date,
        required:true
    },
    outletName:{
        type:String,
        required:true
    },
    status:{
        type:String,
        status:["Preparing","Out For Delivery","Closed"],
        default:"Preparing"
    }
});

module.exports = mongoose.model("orders",ordersSchema);