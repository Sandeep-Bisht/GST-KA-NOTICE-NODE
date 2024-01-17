const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const ServicesSchema = new Schema({   
    title : {
        type : String,
        required : true,
        unique:true, 
        sparse: true
    },
    description : {
        type : String
    },
    featuredIcon: JSON,
    featuredImage: JSON,
    status:{
        type : String,
        required : true,
        default:'Active',
    }

}, {timestamps : true})


const model = moongoose.model("services", ServicesSchema)
module.exports = model;

