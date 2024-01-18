const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    mobile:{ type:String, unique:true, sparse: true}, // "sparse" allows null values to coexist with uniqueness constraint
    email:{ type:String, unique:true, sparse: true },
    facebookID:{ type:String, unique:true, sparse: true },
    password: { type: String},
    usertype:{type: String, require: true},
    status: { type: Boolean},
},{timestamps: true})

module.exports = model('users',userSchema);