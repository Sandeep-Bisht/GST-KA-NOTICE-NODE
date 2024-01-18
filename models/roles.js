const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const RoleSchema = new Schema({ 
    role : {
        type : String,
        required : true,
        unique:true, 
    },
    description:String,

}, {timestamps : true})


const model = moongoose.model("roles", RoleSchema)
module.exports = model;

