const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const NoticesSchema = new Schema({   
    title : {
        type : String,
        required : true,
        unique:true, 
        sparse: true
    },
    description : {
        type : String
    },
    price : {
        type : String
    },
    featuredImage: JSON,
    status:{
        type : String,
        required : true,
        default:'Active',
    }

}, {timestamps : true})


const model = moongoose.model("notices", NoticesSchema)
module.exports = model;

