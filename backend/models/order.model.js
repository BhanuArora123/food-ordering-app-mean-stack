var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var customerSchema = require("./customer.model").schema;


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
        customer:{
            type:customerSchema,
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
            foodItemId:{
                type:ObjectId,
                required:true
            },
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
                name:{
                    type:String,
                    required:true
                },
                id:{
                    type:ObjectId,
                    required:true
                },
                subCategory:{
                    name:{
                        type:String,
                        required:true
                    },
                    id:{
                        type:ObjectId,
                        required:true
                    }
                }
            },
            taxes:[]
        }
    ],
    amountPaid:{
        type:Number,
        default:0
    },
    taxPaid:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enums:["Preparing","Out For Delivery","Closed"],
        default:"Preparing"
    },
    createdAt:{
        type: Date,
        required:true
    },
    orderType:{
        type:String,
        enums:["Dine In","Take Away"],
        default:"Dine In"
    },
    assignedTable:{
        type:Number
    }
},{
    timestamps:true
});

module.exports = mongoose.model("orders",ordersSchema);