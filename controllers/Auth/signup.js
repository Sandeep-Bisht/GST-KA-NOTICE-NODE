var jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const Cache = new NodeCache();
const sendOTP = require('../../config/sendOTP');
const createNewUser = require('../../services/createNewUser')
const UserRoles = require('../../models/user_roles')
const Users = require('../../models/users')
const transporter = require('../../config/nodeMailer');

exports.signup = async (req, res) => {
    try{
        let { email, mobile } = req.body
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        if(email && mobile){
            if(/^[0-9]{10}$/.test(mobile) && emailRegex.test(email)){

                const user = await Users.findOne({
                $or: [
                  { email: email },
                  { mobile: mobile }
                ]
              });


              if(user){
                res.status(200).json({
                    error: false,
                    code : 'USEREXIST',
                    message: "User already exist"
                })
              }else{
                var otp = Math.floor(100000 + Math.random() * 900000);
                otp = otp.toString();
                Cache.set(mobile, otp, 300);  //store otp for 300 seconds in catch
                if(await Cache.get(mobile)){
                // if(/^[0-9]{10}$/.test(mobile)){
                    sendOTP('62385ab87f0231333a04e445', otp, mobile).then((message) => {
                        return res.status(200).json({
                            error:false,
                            "message":"OTP send successfully."
                        })
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            error:true,
                            message:"Error sending otp."
                        })
                    });
            // }

            // if(emailRegex.test(email)){
        
            //       const mailOptions = {
            //         from: process.env.ADMIN_EMAIL || "info@mylookbook.in",
            //         to: email,
            //         subject: "OTP for Login",
            //         html: `<p>Your OTP is ${otp}. It is valid for 5 minutes.</p>`,
            //       };
        
            //        transporter.sendMail(mailOptions,(err,info)=>{
            //         if (err) {
            //             return res.status(500).json({
            //                 err,
            //                 error:true,
            //                 message: "Error sending mail.",
            //               });
            //           } else {
            //             return res.status(200).json({
            //                 error:false,
            //                 "message":"OTP send successfully."
            //             })
            //           }
            //        });
            // }

            }
            else{
                    res.status(400).json({
                      error:true,
                      message: "Something went wrong while generating OTP.",
                    });
    
            }
              }
                
            
        }
        else{
            return res.status(400).send("Invalid User.")
        }
      
        }
        else{
            res.status(400).json({
                error:true,
                message:"Username required."
            })
        }
    }
    catch(err){
        res.status(500).json({
            error:true,
            errorMessage:err.message,
            message:"Something went wrong please try again later."
        })
    }
}

exports.signupVerify = async(req,res) => {
    try{
        let { payload, otp } = req.body;
        let { fullname, mobile, email, gst_no } = payload
         const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

        if(!otp || !mobile || !fullname  || !email){
           return res.status(400).json({
                error:true,
                message:"Invalid Payload."
            })
        }

        if(!(/^[0-9]{10}$/.test(mobile))){
            return res.status(400).json({
                error:true,
                message:"Invalid username.."
            })
        }

        const cachedOTP = await Cache.get(mobile);

        if (otp && cachedOTP && cachedOTP == otp ) {
            Cache.del(mobile); // Remove the OTP from the cache to prevent further use

            let newUserData = {
                user:{mobile, email,usertype : 'mobile'},
                role:'user',
                profile:{fullName:fullname, mobile, email, gst_no, usertype : 'mobile'}
              }

            createNewUser(newUserData).then((response)=>{
                return res.status(response.status).json(response);
            })
            .catch((error)=>{
              return res.status(400).json({
                error:true,
                message: "Error creating new user.",
              });
            });


        }
        else{
            return res.status(401).json({
                error:true,
                message:"Invalid otp."
            })
        }
    }
    catch(err){
        res.status(500).json({
            error:true,
            message:"Something went wrong please try again later."
        })
    }
}

