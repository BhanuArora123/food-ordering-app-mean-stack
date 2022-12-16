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
            },
            taxes:[]
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
    },
    tables:[
        {
            tableId:{
                type:Number,
                required:true
            },
            isAssigned:{
                type:Boolean,
                default:false
            },
            assignedOrderId:{
                type:ObjectId
            }
        }
    ],
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
    isDeleted:{
        type:Boolean,
        default:false
    },
    secretKey:{
        type:String
    }
},{
    usePushEach: true,
    timestamps:true
});

module.exports = mongoose.model("outlet",outletSchema);