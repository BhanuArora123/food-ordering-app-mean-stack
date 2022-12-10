var mongoose = require("mongoose");

var schema = mongoose.Schema;

var customerSchema = new schema({
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    }
});

module.exports = {
    schema:customerSchema,
    model:mongoose.model("customer",customerSchema)
};