var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

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
    ]
});

module.exports = mongoose.model("user",userSchema);