var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

var customerSchema = new schema({
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    brandId:{
        type:ObjectId,
        required:true
    },
    outletId:{
        type:ObjectId,
        required:true
    }// add name 
},
{
    timestamps:true
});

module.exports = {
    schema:customerSchema,
    model:mongoose.model("customer",customerSchema)
};