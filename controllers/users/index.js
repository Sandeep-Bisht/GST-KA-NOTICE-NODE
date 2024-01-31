const { response } = require("express");
const Profile = require("../../models/profile");
const UserRoles =require('../../models/user_roles');
const Users = require('../../models/users')

exports.setProfile = async (req, res) => {
    try{
        // delete data.image;
        let data = { ...req.body, image: req.files[0]};

        updateProfile({user:req.user,profile:data}).then((response)=>{
            return res.status(response.status).json(response);
        })
        .catch((error)=>{
          res.status(400).json({
            error:true,
            errorMessage:error.message,
            message: "Error updating profile.",
          });
        });

        
    }
    catch(err){
        res.status(500).json({
            error:true,
            message:"Something went wrong please try again later."
        })
    }
}

exports.getProfile = async (req, res) => {
    try{
        const existingProfile = await Profile.findOne({'user_id':req.user._id});
        const role = await UserRoles.findOne({'user_id':req.user._id});       
        return res.send({...existingProfile._doc,role:role.role_id});
    }
    catch(err){
        res.status(500).json({
            error:true,
            message:"Something went wrong please try again later."
        })
    }
}


const updateProfile = async (data) => {
    try {
  
      const { user, profile } = data;
  
      const existingProfile = await Profile.findOne({'user_id':user._id});
  
      if(!existingProfile){
        return {
          error: true,
          status: 500,
          message: 'User not found in profile.',
        };
      }
  
      const profileResult = await Profile.findOneAndUpdate({_id:existingProfile._id},{$set:profile}, { new: true });
  
      if (!profileResult) {
        return {
          error: true,
          status: 500,
          message: 'Error updating profile.',
        };
      }
  
      return {
        error: false,
        status: 200,
        message: 'profile updated successfully!',
      };
      
    } catch (error) {
      return {
        error: true,
        errorMessage:error.message,
        status: 500,
        message: 'Error updating profile.',
      };
    }
  };

  exports.getAllUsers = async (req, res) => {
    try {
      let users = await UserRoles.find({role_id:process.env.ROLE_USER});
      let usersId = users.map((item) => item.user_id);
      let profiles = await Profile.find({ user_id: { $in: usersId } });    // we have passed the usersId array in query which will search the array   
      return res.status(200).json({
                error : false,
                data : profiles
              })
    } catch (error) {
      res.status(500).json({
        error : true,
        message : "Something went wrong please try again."
      })
    }
  }