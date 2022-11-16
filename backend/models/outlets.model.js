var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;


var outletSchema = new schema({
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
    // address : {
    //     street:{
    //         type:String,
    //         required:true
    //     },
    //     city:{
    //         type:String,
    //         required:true
    //     },
    //     pinCode:{
    //         type:String,
    //         required:true
    //     }
    // },
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
    brand:{
        id:{
            type:ObjectId,
            required:true
        },
        name:{
            type:String,
            required:true
        }
    }
});

module.exports = mongoose.model("outlet",outletSchema);