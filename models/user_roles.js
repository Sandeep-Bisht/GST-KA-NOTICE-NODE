const moongoose = require('mongoose');

const Schema = moongoose.Schema;

const UserRolesSchema = new Schema({ 
    user_id : {
        require: true,
        type: Schema.Types.ObjectId, 
        ref : "users",
    },
    role_id : {
        require: true,
        type: Schema.Types.ObjectId, 
        ref : "roles",
    }

}, {timestamps : true})


const model = moongoose.model("user_roles", UserRolesSchema)
module.exports = model;

