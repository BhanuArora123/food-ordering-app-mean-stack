var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;


var outletSchema = new schema({
    name:{
        type:String,
        required:true
    },
    admin:{
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        }
    },
    brand:{
        id:{
            type:ObjectId,
            required:true
        },
        name:{
            type:String,
            required:true
        },
        isDisabled:{
            type:Boolean,
            default:false
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
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    usePushEach: true,
    timestamps:true
});

module.exports = mongoose.model("outlet",outletSchema);