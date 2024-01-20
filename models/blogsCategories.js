const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const blogsCategorySchema = new Schema({
     title : {
        required : true,
        type : String,
     },
     slug : {
        required : true,
        type : String,
        unique : true,
     },
     featuredIcon: JSON,
     description : {
        type : String
     },    
     status:{
        type : String,
        required : true,
        default:'active',
    },
})

const model = mongoose.model("blogs_categories", blogsCategorySchema)
module.exports = model;
