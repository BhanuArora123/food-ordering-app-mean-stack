var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;


var ordersSchema = new schema({
    brand:{
        id:{
            type:ObjectId,
            required:true
        },
        name:{
            type:String,
            required:true
        }
    },
    customer:{
        name : {
            type:String,
            required:true
        },
        phoneNumber:{
            type:String,
            required:true
        },
        paidVia:{
            type:String,
            required:true,
            enums:["Cash","Card"]
        }
    },
    outlet:{
        id:{
            type:ObjectId,
            required:true
        },
        name:{
            type:String,
            required:true
        }
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
    status:{
        type:String,
        status:["Preparing","Out For Delivery","Closed"],
        default:"Preparing"
    },
    createdAt:{
        type: Date,
        required:true
    }
});

module.exports = mongoose.model("orders",ordersSchema);