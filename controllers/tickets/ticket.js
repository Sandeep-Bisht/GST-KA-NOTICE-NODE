const UserRole = require('../../models/user_roles')
const Tickets = require('../../models/tickets')
const Cases = require('../../models/cases')
const Payment = require('../../models/payments')
const Razorpay = require("razorpay");
const crypto = require("crypto");
const generateUniqueNo = require('../../services/generateUniqueNo')
const transporter = require('../../config/nodeMailer');
const profile = require('../../models/profile')

exports.getAllTickets = async (req, res) => {
    try{
        const roleId = await UserRole.findOne({user_id:req.user._id}).select('role_id');
        
        if(!roleId || !roleId.role_id){
            return res.status(401).json({
                      error:true,
                      message:"Unautherized user role.",
                    })
        }

        if(roleId.role_id == process.env.ROLE_ADMIN){
            let allTickets = await Tickets.find().populate('notice');
            return res.status(200).json(allTickets);
        }

        if(roleId.role_id == process.env.ROLE_USER){
            let allTickets = await Tickets.find({user_id:req.user._id,status:{ $ne: 'Paid' }}).populate('notice');
            return res.status(200).json(allTickets);
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

exports.getByTicketNo = async (req, res) => {
    try{
        let {ticketNo} = {...req.params};
        const roleId = await UserRole.findOne({user_id:req.user._id}).select('role_id');
        
        if(!roleId || !roleId.role_id){
            return res.status(401).json({
                      error:true,
                      message:"Unautherized user role.",
                    })
        }

        if(roleId.role_id == process.env.ROLE_ADMIN){
            let ticketDetails = await Tickets.findOne({ticketNo}).populate('notice');
            return res.status(200).json(ticketDetails);
        }

        if(roleId.role_id == process.env.ROLE_USER){
            let allTickets = await Tickets.find({user_id:req.user._id,ticketNo}).populate('notice');
            return res.status(200).json(allTickets);
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

exports.askForPayment = async (req, res) => {
  try{
    
      const {ticketNo} = {...req.params};
      var {asked_price,documentRequested} = {...req.body}

      if(!(documentRequested && Array.isArray(documentRequested) && documentRequested.length > 0)){
        documentRequested = [];
      }

      const roleId = await UserRole.findOne({user_id:req.user._id}).select('role_id');
      
      if(!roleId || !roleId.role_id){
          return res.status(401).json({
                    error:true,
                    message:"Unautherized user role.",
                  })
      }

      if(roleId.role_id == process.env.ROLE_ADMIN){
        
        
        const updateFields = {asked_price,documentRequested,'status':'Payment Pending'}
          
          const ticketDetails =  await Tickets.findOneAndUpdate(
            {ticketNo, 'status': 'progress'},
            { $set: updateFields },
            { new: true }
          )

          const userProfile = await profile.findOne({user_id:ticketDetails.user_id});
          let fullName = userProfile.fullName;
          let email = userProfile.email;
          let dateOption = { day: '2-digit', month: 'short', year: 'numeric'};
          let date = new Intl.DateTimeFormat('en-US', dateOption).format(new Date());

          const mailOptions = {
            from: process.env.INFO_EMAIL || "info@gstkanotice.com",
            to: email,
            subject: `Payment Request for Ticket No: ${ticketNo}`,
            html: `<p>Dear <b>${fullName}</b>,</p>

            <p>We trust this message finds you well. We would like to inform you that your recent request, identified by the ticket number <b>${ticketNo}</b>, has been processed, and we are now ready to proceed with the necessary payment.</p>
            
            <p>Amount: <b>${new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(asked_price)
          } /-
          </b></p>
            <p>Due Date: ${date} (3 Days from the Notice updated/ Payment requested dated)</p>
            
            <p>To facilitate the payment, please log in to your account on our portal and follow these steps:</p>
            <ul>
              <li><b>Log in to Your Account:</b> Visit [Portal URL] and log in using your credentials.</li>
              <li><b>Navigate to Tickets Section:</b> Once logged in, navigate to the “Ticket"</li>
              <li><b>Select Your Ticket:</b> Locate the invoice corresponding to the ticket number <b>${ticketNo}</b> and click on it for detailed information.</li>
              <li><b>Make Payment:</b> Use the "Pay Now" option to complete the payment process securely.</li>
            </ul>
            <p>Please ensure that the payment is made by the specified due date. If you encounter any issues during the payment process or if you have any questions regarding the invoice, feel free to reach out to our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b> . We are here to assist you.</p>
            <p>We appreciate your prompt attention to this matter. Thank you for choosing Us</p>
            `,
          };
        
          transporter.sendMail(mailOptions);

          return res.status(200).json(ticketDetails);
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

exports.uploadAskedDocs = async (req, res) => {
  try{
      let {ticketNo} = {...req.params};
      let {title} = {...req.body}

      if(!ticketNo || !title){
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

      if(roleId.role_id == process.env.ROLE_USER){

        if(title == 'otherDocuments'){
          let ticketData = await Tickets.findOne({user_id:req.user._id,ticketNo,'status':'Payment Pending'});
          let otherDocuments = ticketData?.otherDocuments;

          if(otherDocuments && Array.isArray(otherDocuments)){
            otherDocuments = [...ticketData?.otherDocuments, ...req.files];
          }
          else{
            otherDocuments = req.files;
          }

          let ticketNewDetails =  await Tickets.findOneAndUpdate(
            {user_id:req.user._id,ticketNo,'status':'Payment Pending'},
            { $set: {'otherDocuments':otherDocuments} },
            { new: true }
          ).populate('notice');

          return res.status(200).json(ticketNewDetails);
        }
      
          let ticketData = await Tickets.findOne({user_id:req.user._id,ticketNo,'status':'Payment Pending'});
          let documentRequested = ticketData?.documentRequested;

          if(documentRequested && Array.isArray(documentRequested)){

              documentRequested =[...ticketData?.documentRequested]

              let currentDocumentIndex = documentRequested.findIndex(el => el.title == title)
              if(currentDocumentIndex > -1){
                let updatedDocument = {...documentRequested[currentDocumentIndex],document:req.files[0] }
                documentRequested[currentDocumentIndex] = updatedDocument;
                
                const ticketDetails =  await Tickets.findOneAndUpdate(
                  {user_id:req.user._id,ticketNo,'status':'Payment Pending'},
                  { $set: {'documentRequested':documentRequested} },
                  { new: true }
                ).populate('notice');
      
                return res.status(200).json(ticketDetails);
              }
              else{
                return res.status(400).json({
                  error:true,
                  message:"please provide correct information"
                })
              }
          }
          else{
            return res.status(400).json({
              error:true,
              message:"please provide correct information"
            })
          }
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

exports.createOrder = async (req, res) => {
  try{
      let {ticketNo} = {...req.params};
      let {status} = {...req.body}

      if(!ticketNo){
        return res.status(400).json({
                  error:true,
                  message:"Ticket No not found.",
                })
    }

      const roleId = await UserRole.findOne({user_id:req.user._id}).select('role_id');

      if(!roleId || !roleId.role_id){
          return res.status(401).json({
                    error:true,
                    message:"Unautherized user role.",
                  })
      }

      if(roleId.role_id == process.env.ROLE_USER){

          let ticketDetails = await Tickets.findOne({user_id:req.user._id, ticketNo, status}).populate('notice');;

          if(!ticketDetails){
            return res.status(400).json({
              error:true,
              message:"Data not found in tickets.",
            })
          };
          
          let ableToPay = true;

          if(ticketDetails.documentRequested && Array.isArray(ticketDetails.documentRequested) ){
            
            for(let i = 0; i < ticketDetails.documentRequested.length; i++){
                if(ticketDetails.documentRequested[i]?.required && (!ticketDetails.documentRequested[i]?.document || !ticketDetails.documentRequested[i]?.document?.path)){
                  ableToPay = false;
                  break;
                }
            }

          }

          if(!ableToPay){
            return res.status(400).json({
              error:true,
              message:"Document required.",
            })
          }

          const instance = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_SECRET_KEY,
          });

          const paymentOptions = {
            amount:  ticketDetails?.asked_price * 100,
            currency: "INR",
            receipt: ticketNo + crypto.randomBytes(10).toString("hex"),
            notes:{ticketNo}
          };

          try{

            instance.orders.create(paymentOptions, async (error, order) => {
              if (error) {
                return res.status(500).json({error, message: "Something Went Wrong In Payment!" });
              }
              else{

              let paymentData = {
                user_id: req.user._id,
                reference_id: ticketDetails._id,
                amount: order.amount ? order.amount : paymentOptions.amount,
                currency: order.currency ? order.currency : paymentOptions.currency,
                receipt: order.receipt ? order.receipt : paymentOptions.receipt,
                orderId: order.id ? order.id : null,
                rzp_order_createdAt: order.created_at ? order.created_at : null,
                payment_status: order.status ? order.status : 'initiated',
                created_by: req.user._id,
              }

              Payment.create(paymentData).then(async(result)=>{
                if (result) {

                  return res.status(200).json({error:false, order, ticketDetails, payment:result, 'message':"payment initiated successfully." });

                } else {
                  res.status(400).json({
                    error:true,
                    status: 400,
                    message: "Unable to create payment."
                  });
                }
              }).catch((error)=>{
                res.status(400).json({
                  error:true,
                  errorMessage:error.message,
                  status: 400,
                  message: "Please provide correct information to create payment."
                });
              })
            }
            });

          }
          catch(paymentError){
            return res.status(500).json({error:paymentError, message: "Something Went Wrong in payment!" });
          }
      }
      else{
        return res.status(401).json({
          error:true,
          message:"Unautherized role.",
        })
      }

    }
    catch(error){
      res.status(500).json({
        error:true,
        message:"please provide correct information"
      })
    }
}

exports.verifyPayment = async (req,res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {

      let payment = await Payment.findOneAndUpdate(
        {orderId:razorpay_order_id},
        { $set: {'paymentId':razorpay_payment_id,'payment_status':'success'} },
        { new: true });

        let ticketDetails =  await Tickets.findByIdAndUpdate(payment.reference_id,
            { $set: {'status':'Paid'} },
            { new: true }
        ).populate('notice');

        const userProfile = await profile.findOne({user_id:req.user._id});
        const fullName = userProfile.fullName;
        const email = userProfile.email;
        let dateOption = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        let date = new Intl.DateTimeFormat('en-US', dateOption).format(new Date());

        const paymentMailOptions = {
          from: process.env.INFO_EMAIL || "info@gstkanotice.com",
          to: email,
          subject: `Payment Successfully Processed for Ticket No: ${ticketDetails.ticketNo}`,
          html: `<p>Dear <b>${fullName}</b>,</p>
          <p>We hope this message finds you well. We are pleased to inform you that the payment for your recent request, associated with the ticket number <b>${ticketDetails.ticketNo}</b>, has been successfully processed.</p>
          
          <p><b>Payment Status:</b> Paid</p>
        <p><b> Amount:</b> ${new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(ticketDetails.asked_price)
      } /-</p>
          <p><b>Transaction ID:</b> ${razorpay_payment_id}</p>
          <p><b>Date and Time:</b> ${date}</p>
          
          <p>We appreciate your prompt attention to this matter, and we would like to thank you for choosing GST KA NOTICE. </p>
          
        <p> Your timely payment ensures the continued smooth operation of your services.</p>
          <p>If you have any further questions or require additional assistance, please do not hesitate to contact our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b>.</p>
          
          <p>Once again, thank you for your business, and we look forward to serving you in the future.</p>
          
          `,
        };
    
      transporter.sendMail(paymentMailOptions);

      const caseNo = await generateUniqueNo('C')
      let data =  { user_id: req.user._id, 
                    caseNo, 
                    ticket:ticketDetails._id, 
                    paymentID:payment._id, 
                    paid_amount:ticketDetails.asked_price,
                    created_by:req.user._id};

      Cases.create(data).then(async(result)=>{
        if (result) {

          const caseCreatedMailOptions = {
            from: process.env.INFO_EMAIL || "info@gstkanotice.com",
            to: email,
            subject: `Case Created Successfully - Case No: ${result.caseNo} for Ticket No: ${ticketDetails.ticketNo}`,
            html: `<p>Dear <b>${fullName}</b>,</p>

            <p>We trust this message finds you well. We would like to inform you that a case has been successfully created in response to your recent payment for the ticket number <b>${ticketDetails.ticketNo}</b>.</p>
            
            <p><b>Case Number:</b> ${result.caseNo}</p>
            
            <p>Our team is now reviewing the details of your case and will work diligently to provide you with a resolution. You can track the status and progress of your case at any time by logging into your account on our website and navigating to Cases under the Profile section.</p>
            
            <p>If you have any further inquiries or if there are specific details you would like to provide regarding your payment, please reply to this email with the case number  ${result.caseNo} in the subject line.</p>
            
            <p>We appreciate your cooperation and prompt attention to this matter. If you have additional questions or require assistance, please feel free to reach out to our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b> . We are here to assist you.</p>
            
           <p> Thank you for choosing GST KA NOTICE. We value your trust and look forward to assisting you further.</p>
            
            `,
          };
      
        transporter.sendMail(caseCreatedMailOptions);


          return res.status(200).json({
            error:false,
            status: 200,
            message: "Case created successfully",
            data: result
          });


        } else {
          return res.status(400).json({
            error:true,
            status: 400,
            message: "Please provide correct information"
          });
        }
      }).catch((error)=>{
        return res.status(400).json({
          error:true,
          errorMessage:error.message,
          status: 400,
          message: "Please provide correct information"
        });
      })

    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
}

exports.failedPayment = async (req,res) => {
  try {
    const { metadata } = req.body;

    await Payment.findOneAndUpdate(
      {orderId:metadata.order_id},
      { $set: {'error':req.body,'payment_status':'failed'} },
      { new: true });

      return res.status(200).json({ message: "Payment updated successfully." });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
}

exports.removeOtherDocuments = async (req,res) => {
  try{
    let {ticketNo} = {...req.params};
    let {otherDocuments} = {...req.body}

    if(!otherDocuments || !ticketNo){
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

    if(roleId.role_id == process.env.ROLE_USER){

        if(Array.isArray(otherDocuments)){
          let ticketNewDetails =  await Tickets.findOneAndUpdate(
            {user_id:req.user._id,ticketNo,'status':'Payment Pending'},
            { $set: {'otherDocuments':otherDocuments} },
            { new: true }
          ).populate('notice');

          return res.status(200).json(ticketNewDetails);
        }
        else{
          return res.status(400).json({
            error:true,
            message:"please provide correct information"
          })
        }
    
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