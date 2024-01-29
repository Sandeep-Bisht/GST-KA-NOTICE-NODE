const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const NoticesSchema = new Schema({   
    service:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "services" 
    },
    title : {
        type : String,
        required : true,
        unique:true, 
    },
    starting_price : {
        type : String,
        required:true
    },
    featuredIcon: JSON,
    featuredImage: JSON,
    excerpt: String,
    description: String,
    tags: JSON,
    seo_title:String,
    seo_url:String,
    status:{
        type : String,
        required : true,
        default:'active',
    },
    created_by:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "users" 
    },
    modified_by:{
        type : Schema.Types.ObjectId,
        ref : "users" 
    }

}, {timestamps : true})


const model = moongoose.model("notices", NoticesSchema)
module.exports = model;

