var mongoose = require("mongoose");

var schema = mongoose.Schema;

var brandsSchema = new schema({
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
    isDisabled:{
        type:Boolean,
        default:false
    },
    permissions:[
        {
            permissionId:{
                type:Number,
                required:true
            },
            permissionName:{
                type:String,
                required:true
            }
        }
    ],
    secretKey:{
        type:String
    }
},{
    timestamps:true
});

module.exports = mongoose.model("brands",brandsSchema);