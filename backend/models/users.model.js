var mongoose = require("mongoose");

var schema = mongoose.Schema;

const userSchema = new schema({
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
    deliveryAddresses : [
        {
            street:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            pinCode:{
                type:String,
                required:true
            }
        }
    ],
    cart:[
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
            outletName:{
                type:String,
                required:true
            }
        }
    ],
    orders:[
        {
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
        }
    ]
});

module.exports = mongoose.model("user",userSchema);