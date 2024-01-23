const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const caseSchema = new Schema({   
    user_id:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "users" 
    },
    caseNo:{
        required:true,
        type : String,
        unique:true,
    },
    ticket:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "tickets",
        unique:true,
    },
    reply_doc:{
        type:JSON
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

