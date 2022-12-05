var mongoose = require("mongoose");

var schema = mongoose.Schema;

var tax = require("../models/taxes.model").schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var foodSchema = new schema({
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
    imageUrl:{
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
    isVeg:{
        type:Boolean,
        default:true
    },
    taxes:[
        {
            tax:{
                type:tax,
                required:true
            },
            percentage:{
                type:Number,
                required:true
            }
        }
    ]
});

module.exports = mongoose.model("food",foodSchema);