var mongoose = require("mongoose");

var schema = mongoose.Schema;

var userSchema = new schema({
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
            },
            category:{
                type:String,
                required:true
            },
            subCategory:{
                type:String,
                required:true
            },
        }
    ]
});

module.exports = mongoose.model("user",userSchema);