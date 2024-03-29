const UserRole = require('../../models/user_roles')
const Cases = require('../../models/cases')
const profile = require('../../models/profile')
const transporter = require('../../config/nodeMailer');
const casesMailTemplate = require('../../email/cases')


exports.getAllCases = async (req, res) => {
    try{
        const roleId = await UserRole.findOne({user_id:req.user._id}).select('role_id');
        
        if(!roleId || !roleId.role_id){
            return res.status(401).json({
                      error:true,
                      message:"Unautherized user role.",
                    })
        }

        if(roleId.role_id == process.env.ROLE_ADMIN){
            let allCases = await Cases.find().populate({
              path: 'ticket',
              populate: {
                  path: 'notice'
              }
          }).sort({ createdAt: -1 });
            return res.status(200).json(allCases);
        }

        if(roleId.role_id == process.env.ROLE_USER){
          
          let allCases = await Cases.find({user_id:req.user._id}).populate({
            path: 'ticket',
            populate: {
                path: 'notice'
            }
          });
          return res.status(200).json(allCases);
        }

        return res.status(401).json({
            error:true,
            message:"Unautherized role.",
          })
      }
      catch(error){
        res.status(500).json({
          error:true,
          message:"please provide correct information"
        })
      }
}

exports.getByCaseNo = async (req, res) => {
    try{
        let {caseNo} = {...req.params};
        const roleId = await UserRole.findOne({user_id:req.user._id}).select('role_id');
        
        if(!roleId || !roleId.role_id){
            return res.status(401).json({
                      error:true,
                      message:"Unautherized user role.",
                    })
        }

        if(roleId.role_id == process.env.ROLE_ADMIN){
            let caseDetails = await Cases.findOne({caseNo}).populate({
              path: 'ticket',
              populate: {
                  path: 'notice'
              }
          });
            return res.status(200).json(caseDetails);
        }

        if(roleId.role_id == process.env.ROLE_USER){

          let caseDetails = await Cases.findOne({user_id:req.user._id,caseNo}).populate({
            path: 'ticket',
            populate: {
                path: 'notice'
            }
          });
          return res.status(200).json(caseDetails);
        }

        return res.status(401).json({
            error:true,
            message:"Unautherized role.",
          })
      }
      catch(error){
        res.status(500).json({
          error:true,
          message:"please provide correct information"
        })
      }
}

exports.replyDocument = async (req, res) =>{
  try{
    let {caseNo} = {...req.params};
    let reply_doc = req.files[0]

    if(!caseNo || !reply_doc){
      res.status(400).json({
        error:true,
        message:"please provide correct information"
      })
    }

    const roleId = await UserRole.findOne({user_id:req.user._id}).select('role_id');
    
    if(!roleId || !roleId.role_id){
        return res.status(401).json({
                  error:true,
                  message:"Unautherized user role.",
                })
    }

    if(roleId.role_id == process.env.ROLE_ADMIN){

        let caseData = await Cases.findOneAndUpdate({caseNo,'status':'progress'},{ $set: {reply_doc,'status':'replied'} },{ new: true }).populate({
          path: 'ticket',
          populate: {
              path: 'notice'
          }
      });

      const userProfile = await profile.findOne({user_id:caseData.user_id});
            
      let fullName = userProfile.fullName;
      let email = userProfile.email;
      let template = casesMailTemplate({fullName,caseData})

      const mailOptions = {
          from: process.env.INFO_EMAIL || "info@gstkanotice.com",
          to: email,
          subject: `Submission of Reply and Response for Case No: ${caseData.caseNo}`,
          html: template,
        };

        const sendEmailToAdmin = {
          from: process.env.INFO_EMAIL || "info@gstkanotice.com",
          to: process.env.INFO_EMAIL || "info@gstkanotice.com",
          subject: `Submission of Reply and Response for Case No: ${caseData.caseNo}`,
          html: template,
        };
      
      transporter.sendMail(mailOptions);
      transporter.sendMail(sendEmailToAdmin);


        return res.status(200).json(caseData);
    }
    else{
    return res.status(401).json({
              error:true,
              message:"Unautherized role.",
            })
    }
  }
  catch(error){
    return res.status(500).json({
      error:true,
      message:"please provide correct information"
    })
  }
}