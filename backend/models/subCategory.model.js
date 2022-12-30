var mongoose = require("mongoose");

var schema = mongoose.Schema;

var ObjectId  = mongoose.Schema.Types.ObjectId;

var subCategorySchema = new schema({
    name:{
        type:String,
        required:true
    },
    parentCategory:{
        name:{
            type:String,
            required:true
        },
        id:{
            type:ObjectId,
            required:true
        }
    }
},{
    timestamps:true
});

module.exports = mongoose.model("subCategory",subCategorySchema);