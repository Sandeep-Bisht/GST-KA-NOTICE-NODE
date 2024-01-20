const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const caseSchema = new Schema({   
    user_id:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "users" 
    },
    ticket:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "tickets" 
    },
    reply_doc:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "notices" 
    },
    price:{
        required:true,
        type : String
    },
    document:{
        required:true,
        type:JSON
    },
    documentRequested:{
        type:JSON           //Manage required document in functionality.
    },
    status:{
        type : String,
        required : true,
        default:'progress',
    },
    created_by:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "users" 
    },

}, {timestamps : true})


const model = moongoose.model("cases", caseSchema)
module.exports = model;

