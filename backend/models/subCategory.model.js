var mongoose = require("mongoose");

var schema = mongoose.Schema;

var subCategorySchema = new schema({
    name:{
        type:String,
        required:true
    },
    parentCategory:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model("subCategory",subCategorySchema);