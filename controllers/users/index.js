const Profile = require("../../models/profile");
const UserRoles =require('../../models/user_roles')

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