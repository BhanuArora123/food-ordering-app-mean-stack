
var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var offerSchema = new schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    maximumUse:{
        type:Number,
        default:1
    },
    startFrom:{
        type:Date,
        required:true
    },
    validTill:{
        type:Date,
        required:true
    },
    orderType:{
        type:String,
        enums:["Dine In","Take Away","Both"],
        default:"Dine In"
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
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

offerSchema.pre("validate",function (next) {
    if(this.validTill < this.startFrom){
        return next(new Error("End Date must be greater than Start Date"));
    }
    next();
})

module.exports = {
    schema:offerSchema,
    model:mongoose.model("offer",offerSchema)
}