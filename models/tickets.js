const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const ticketSchema = new Schema({   
    user_id:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "users" 
    },
    ticketNo:{
        required:true,
        type : String,
        unique:true,
    },
    notice:{
        required:true,
        type : Schema.Types.ObjectId,
        ref : "notices" 
    },
    asked_price:{
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


const model = moongoose.model("tickets", ticketSchema)
module.exports = model;

