const UserRole = require('../../models/user_roles')
const Tickets = require('../../models/tickets')
const Cases = require('../../models/cases')
const Payment = require('../../models/payments')
const Razorpay = require("razorpay");
const crypto = require("crypto");
const generateUniqueNo = require('../../services/generateUniqueNo')

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
          message:"please provide correct information 1"
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
          )

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
                )
      
                return res.status(200).json(ticketDetails);
              }
              else{
                return res.status(400).json({
                  error:true,
                  message:"please provide correct information 2"
                })
              }
          }
          else{
            return res.status(400).json({
              error:true,
              message:"please provide correct information 3"
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
        message:"please provide correct information 4"
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

          let ticketDetails = await Tickets.findOne({user_id:req.user._id, ticketNo, status});

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
      )

      const caseNo = await generateUniqueNo('Case')
      let data = { user_id:req.user._id, caseNo, ticket:ticketDetails._id, created_by:req.user._id};

      Cases.create(data).then((result)=>{
        if (result) {
          res.status(200).json({
            error:false,
            status: 200,
            message: "Case created successfully",
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