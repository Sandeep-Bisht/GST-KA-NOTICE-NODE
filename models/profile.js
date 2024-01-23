const moongoose = require('mongoose')
const Schema = moongoose.Schema

const ProfileSchema = new Schema({
    user_id: {
        required : true,
        type : Schema.Types.ObjectId,
        unique : true,
        ref : "users"       
    },
    fullName: {
        type:String,
        required:true
    },
    gst_no : {
            type : String
        },
    email: {
        type : String,
        unique : true,
        required: true
    },
    mobile: {
        unique : true,
        type : String,
        required: true
    },
    gender: {
        type: String,
    },
    dob: {
        type: String,
    },
    alias: String,
    image:{
        type : JSON,
    },
    usertype:{
        type : String,
        required:true,
    },
    address : { type : JSON },
    status:{
        type : String,
        required : true,
        default:'active',
    },

}, { timestamps : true})

const model = moongoose.model("profile", ProfileSchema)
module.exports = model;