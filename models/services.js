const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const ServicesSchema = new Schema({   
    title : {
        type : String,
        required : true,
        unique:true,
    },
    featuredIcon: JSON,
    featuredImage: JSON,
    description : {
        type : String
    },
    status:{
        type : String,
        required : true,
        default:'Active',
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


const model = moongoose.model("services", ServicesSchema)
module.exports = model;

