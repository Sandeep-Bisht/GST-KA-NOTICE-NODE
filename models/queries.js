const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const QueriesSchema = new Schema({   
    name : {
        type : String,
        required : true,
        unique:true, 
        sparse: true
    },
    email: {
        type : String,
        required : true,
    },
    mobile: {
        type : String,
        required : true,
    },
    message:{
        type : String,
    }

}, {timestamps : true})


const model = moongoose.model("queries", QueriesSchema)
module.exports = model;

