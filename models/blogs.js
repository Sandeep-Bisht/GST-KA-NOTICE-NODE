const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: {
        required: true,
        type : String
    },
    slug: {
        required : true,
        type : String,
        unique : true
    },
    description: {
        type: String
    },
    category: {
        required : true,
        type : Schema.Types.ObjectId,
        ref:"categories"
    },
    featuredImage: {
        required : true,
        type:JSON
    },
    content: {
        required: true,
        type : String
    },
    tags: {
        type : Array,
    },
    onlyForUser:{
       type: Boolean,
       default : false,
    },
    status:{
        type : String,
        required : true,
        default:'published',
    },
    created_by:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "users" 
    },
},{ timestamps : true})

const model = mongoose.model("blogs", BlogSchema)
module.exports = model;