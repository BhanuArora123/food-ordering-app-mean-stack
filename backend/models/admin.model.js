var mongoose = require("mongoose");

var schema = mongoose.Schema;

var adminSchema = new schema({
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
    role:{
        type:String,
        enums:["superAdmin","admin"],
        default:"superAdmin"
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

module.exports = mongoose.model("admin",adminSchema);