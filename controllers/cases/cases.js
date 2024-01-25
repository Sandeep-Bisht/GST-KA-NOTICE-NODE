const UserRole = require('../../models/user_roles')
const Cases = require('../../models/cases')
const profile = require('../../models/profile')
const transporter = require('../../config/nodeMailer');

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
          });
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

      const mailOptions = {
          from: process.env.INFO_EMAIL || "info@gstkanotice.com",
          to: email,
          subject: `Submission of Reply and Response for Case No: ${caseData.caseNo}`,
          html: `<p>Dear <b>${fullName}</b>,</p>

          <p>We trust this email finds you well. As part of the ongoing resolution process for Case No: <b>${caseData.caseNo}</b>, we would like to inform you that the reply and response documents have been prepared and are ready for download and submission to the Goods and Services Tax Network (GSTN).</p>
          <p>Documents for Submission:</p>
          <ul>
           <li> <b>Reply Document:</b> Download from navigating to cases section under your profile and navigating to case no <b>${caseData.caseNo}</b>.</li>
          </ul>
          <p>Please download the attached documents, carefully review the information, and ensure its accuracy. Following that, kindly proceed with the submission to GSTN using the prescribed portal or method outlined in the notice.</p>
          
          <p><b>Important Note:</b> Ensure that the submission is made within the stipulated timeframe mentioned in the notice to avoid any potential implications.</p>
          
          <p>If you encounter any issues during the submission process or if you require any clarification on the documents provided, please do not hesitate to contact our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b> .</p>
          
          <p>Thank you for your cooperation in this matter. We appreciate your prompt attention to the case, and we remain committed to assisting you throughout the resolution process.</p>
          
          `,
        };
      
      transporter.sendMail(mailOptions);


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