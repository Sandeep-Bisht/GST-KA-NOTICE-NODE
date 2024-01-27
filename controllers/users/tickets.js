const generateUniqueNo = require('../../services/generateUniqueNo')
const Tickets = require('../../models/tickets'); // Import your tickets model
const profile = require('../../models/profile')
const transporter = require('../../config/nodeMailer');
const {signature} = require('../../email/common')

exports.createTicket = async (req, res) => {
    try{
        const ticketNo = await generateUniqueNo('T')
        let data = { ...req.body, user_id:req.user._id, created_by:req.user._id, ticketNo, document: req.files.document[0]};

        Tickets.create(data).then(async (result)=>{
          if (result) {

            const userProfile = await profile.findOne({user_id:req.user._id});
            
            let fullName = userProfile.fullName;
            let email = userProfile.email;
            const mailOptions = {
                from: process.env.INFO_EMAIL || "info@gstkanotice.com",
                to: email,
                subject: `Ticket Created Successfully - Your Ticket Number: ${result.ticketNo}`,
                html: `<p>Dear <b>${fullName}</b>,</p>
                <p>We hope this message finds you well. We would like to inform you that your request has been successfully received, and a ticket has been created to address your inquiry.</p>
                
                <p>Ticket Number: <b>${result.ticketNo}</b><p>
                
                <p>Our support team is now reviewing your request, and we will strive to provide a timely and satisfactory resolution for your uploaded Notice. You can track the status and progress of your ticket at any time by logging into your account on our website.</p>
                
                <p>If you have any additional information or updates regarding your request, please reply to this email, ensuring the ticket number is included in the subject line.</p>
                
                <p>We appreciate your patience as we work to assist you promptly. If you have any urgent concerns or require immediate assistance, please don't hesitate to contact our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b></p>
                
                <p>Thank you for choosing us for your needs.</p>
                ${signature}
                `,
              };
            
            transporter.sendMail(mailOptions);

            res.status(200).json({
              error:false,
              status: 200,
              message: "Ticket created successfully",
              data: result
            });

          } else {
            res.status(400).json({
              error:true,
              status: 400,
              message: "Please provide correct information"
            });
          }
        }).catch((error)=>{
          res.status(400).json({
            error:true,
            errorMessage:error.message,
            status: 400,
            message: "Please provide correct information"
          });
        })
      }
      catch(error){
        res.status(500).json({
          error:true,
          errorMessage:error.message,
          message:"please provide correct information"
        })
      }
}