const UserRole = require('../../models/user_roles');
const Payment = require('../../models/payments');
const Profile = require('../../models/profile')

// Replace with your Razorpay API key and secret

exports.getAllPayments = async (req, res) => {
  try {
    const user = await UserRole.findOne({user_id:req.user._id}).select('role_id');

    if(!user || !user.role_id){
      return res.status(401).json({
                error:true,
                message:"Unautherized user role.",
              })
    }

    if(user.role_id != process.env.ROLE_ADMIN){
      return res.status(401).json({
        error: true,
        message: "Unauthorized User"
      });
    }

      let allPayments = await Payment.find()
      if(!allPayments){
        res.status(200).json({
          error : true,
          message : "Please try again"
        })
      }else{
        res.status(200).json({
          error : false,
          data : allPayments
      })
    }
    
  } catch (error) {
    res.status(500).json({
      error : true,
      message : "Something went wrong"
    })
  }
}
