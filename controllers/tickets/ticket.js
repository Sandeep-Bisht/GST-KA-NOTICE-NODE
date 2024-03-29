const UserRole = require("../../models/user_roles");
const Tickets = require("../../models/tickets");
const Cases = require("../../models/cases");
const Payment = require("../../models/payments");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const generateUniqueNo = require("../../services/generateUniqueNo");
const transporter = require("../../config/nodeMailer");
const profile = require("../../models/profile");
const { signature } = require("../../email/common");

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
        let allTickets = await Tickets.find().populate('notice').sort({ createdAt: -1 });
        return res.status(200).json(allTickets);
    }

    if(roleId.role_id == process.env.ROLE_USER){
        let allTickets = await Tickets.find({user_id:req.user._id,status:{ $ne: 'paid' }}).populate('notice');
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
  try {
    let { ticketNo } = { ...req.params };
    const roleId = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );

    if (!roleId || !roleId.role_id) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    if (roleId.role_id == process.env.ROLE_ADMIN) {
      let ticketDetails = await Tickets.findOne({ ticketNo }).populate("notice");
      const userData = await profile.findOne({ user_id: ticketDetails.user_id });
      if(userData){
        let user = userData;
        ticketDetails = ticketDetails.toObject();
         ticketDetails.user_data = user;
        return res.status(200).json(ticketDetails);
      }
     
     
    }

    if (roleId.role_id == process.env.ROLE_USER) {
      let allTickets = await Tickets.find({
        user_id: req.user._id,
        ticketNo,
      }).populate("notice");
      return res.status(200).json(allTickets);
    }

    return res.status(401).json({
      error: true,
      message: "Unautherized role.",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "please provide correct information",
    });
  }
};

exports.requestDocuments = async (req, res) => {
  try{
    const { ticketNo } = { ...req.params };
    var { documentRequested } = { ...req.body };
    const currentlyRequestedDocuments = documentRequested;

    if (!(documentRequested && Array.isArray(documentRequested) && documentRequested.length > 0 )) {
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    const roleId = await UserRole.findOne({ user_id: req.user._id }).select("role_id");
    
    if (!roleId || !roleId.role_id || !roleId.role_id.equals(process.env.ROLE_ADMIN)) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    const ticketDetails = await Tickets.findOne({ticketNo});

    if(!ticketDetails){
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    if(!(ticketDetails.status == 'in progress' || ticketDetails.status == 'document uploaded')){
      return res.status(400).json({
        error: true,
        message: "Invalid Request",
      });
    }

    let previousDocumentRequested = ticketDetails.documentRequested ? ticketDetails.documentRequested : [];

    const updateFields = {
      documentRequested:[...documentRequested, ...previousDocumentRequested],
      status: "document requested",
    };

    const updatedTicketDetails = await Tickets.findOneAndUpdate(
      { ticketNo },
      { $set: updateFields },
      { new: true }
    );


    const userProfile = await profile.findOne({
      user_id: updatedTicketDetails.user_id,
    });

    let fullName = userProfile.fullName;
    let email = userProfile.email;
    let dateOption = { day: "2-digit", month: "short", year: "numeric" };
    let date = new Intl.DateTimeFormat("en-US", dateOption).format(
      new Date()
    );

    const mailOptions = {
      from: process.env.INFO_EMAIL || "info@gstkanotice.com",
      to: email,
      subject: `Document Requested for Ticket No: ${ticketNo}`,
      html: `<p>Dear <b>${fullName}</b>,</p>

          <p>Thanks for registering on our platform GSTKA NOTICE, we are privileged to serve you.</p>
          
          <p>To provide the Consultation and required estimate can you please provide the following document.         
          <ul>
          ${currentlyRequestedDocuments.map((item)=>{
          return(`<li>${item.title}</li>`)
          }).join('')}
          </ul>
          
          <p>For your convenience, you can attach the document in reply to this mail. We will get back to you as soon as possible.</p>
          ${signature}
          `,
    };

    const sendEmailToAdmin = {
      from: process.env.INFO_EMAIL || "info@gstkanotice.com",
      to: process.env.INFO_EMAIL || "info@gstkanotice.com",
      subject: `Document Requested for Ticket No: ${ticketNo}`,
      html: `<p>Dear <b>Admin</b>,</p>
      <p>An email has been sent to user to provide the following documents.</p>          
      <ul>
      ${currentlyRequestedDocuments.map((item)=>{
      return(`<li>${item.title}</li>`)
      }).join('')}
      </ul>
      <p>For your convenience, you can attach the document in reply to this mail. We will get back to you as soon as possible.</p>

          ${signature}
          `,
    };

    transporter.sendMail(mailOptions);
    transporter.sendMail(sendEmailToAdmin)

    return res.status(200).json(updatedTicketDetails);

  }
  catch(error){
    return res.status(500).json({
      error: true,
      message: "please provide correct information",
    });
  }
}

exports.uploadRequestedDocuments = async (req, res) =>{
  try{
    const { ticketNo } = { ...req.params };
    const documents = req.files;

    if (!ticketNo || !documents || !documents.length > 0) {
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    const roleId = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );
    const userProfile = await profile.findOne({
      user_id: req.user._id,
    });

    

    if (!roleId || !roleId.role_id || !roleId.role_id.equals(process.env.ROLE_USER)) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    var ticketData = await Tickets.findOne({
      user_id: req.user._id,
      ticketNo,
      status: "document requested",
    });

    if(!ticketData){
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    var requestedDocuments = ticketData?.documentRequested;
    
    if(!(requestedDocuments && Array.isArray(requestedDocuments) && requestedDocuments.length > 0)){
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    let promises = documents.map((item) =>{
      let index = parseInt(item.fieldname.split('documentRequested_')[1]);
      if(requestedDocuments[index] && requestedDocuments[index]?.type == 'document requested' && (!requestedDocuments[index]?.document || !requestedDocuments[index]?.document?.path)){
        requestedDocuments[index]['document'] = item;
      }
    })

    Promise.all(promises);

    const mailOptions = {
      from: process.env.INFO_EMAIL || "info@gstkanotice.com",
      to: userProfile.email,
      subject: `Document Requested for Ticket No: ${ticketNo}`,
      html: `<p>Dear <b>${userProfile.fullName}</b>,</p>

          <p>Thanks for registering on our platform GSTKA NOTICE, we are privileged to serve you.</p>
          
          <p>We have recived your requested documents, will update you soon on your status.      
         
          
          ${signature}
          `,
    };

    const sendEmailToAdmin = {
      from: process.env.INFO_EMAIL || "info@gstkanotice.com",
      to: process.env.INFO_EMAIL || "info@gstkanotice.com",
      subject: `Submit Requested Document for Ticket No: ${ticketNo}`,
      html: `<p>Dear <b>Admin</b>,</p>
      <p><b>${userProfile.fullName}</b> has submitted the requested documents.</p>          
      
      <p>You can update the user by accepting or rejecting the document.</p>

          ${signature}
          `,
    };

    const ticketDetails = await Tickets.findOneAndUpdate(
      {
        user_id: req.user._id,
        ticketNo,
        status: "document requested",
      },
      { $set: { documentRequested: requestedDocuments, status : 'document uploaded' } },
      { new: true }
    ).populate("notice");

    transporter.sendMail(mailOptions);
    transporter.sendMail(sendEmailToAdmin)
    return res.status(200).json(ticketDetails);
  }
  catch(error){
    return res.status(500).json({
      error: true,
      message: "Something went wrong.",
    });
  }
}

exports.askForPayment = async (req, res) => {
  try {
    const { ticketNo } = { ...req.params };
    var { asked_price, documentRequested } = { ...req.body };

    if (!ticketNo || !asked_price) {
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }


    const roleId = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );

    if (!roleId || !roleId.role_id || !roleId.role_id.equals(process.env.ROLE_ADMIN)) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    const ticketData = await Tickets.findOne({ ticketNo });

    if(!ticketData || !(ticketData?.status == 'in progress' || ticketData?.status == 'document uploaded')){
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    if (!( documentRequested && Array.isArray(documentRequested) && documentRequested.length > 0 )){
      documentRequested = [];
    }

    let previousDocumentRequested = ticketData.documentRequested ? ticketData.documentRequested : [];

    documentRequested = documentRequested.map((item) => {item['type'] = 'payment requested'; return item;})

    documentRequested = [...previousDocumentRequested, ...documentRequested];

    const updateFields = {
        asked_price,
        documentRequested,
        status: "payment requested",
    };

      const ticketDetails = await Tickets.findOneAndUpdate(
        { ticketNo },
        { $set: updateFields },
        { new: true }
      );

      const userProfile = await profile.findOne({
        user_id: ticketDetails.user_id,
      });
      let fullName = userProfile.fullName;
      let email = userProfile.email;
      let dateOption = { day: "2-digit", month: "short", year: "numeric" };
      let date = new Intl.DateTimeFormat("en-US", dateOption).format(
        new Date()
      );

      const mailOptions = {
        from: process.env.INFO_EMAIL || "info@gstkanotice.com",
        to: email,
        subject: `Payment Request for Ticket No: ${ticketNo}`,
        html: `<p>Dear <b>${fullName}</b>,</p>

            <p>We trust this message finds you well. We would like to inform you that your recent request, identified by the ticket number <b>${ticketNo}</b>, has been processed, and we are now ready to proceed with the necessary payment.</p>
            
            <p>Amount: <b>${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(asked_price)} /-
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
            ${signature}
            `,
      };

      const sendEmailToAdmin = {
        from: process.env.INFO_EMAIL || "info@gstkanotice.com",
        to: process.env.INFO_EMAIL || "info@gstkanotice.com",
        subject: `Payment Request for Ticket No: ${ticketNo}`,
        html: `<p>Dear <b>Admin</b>,</p>

            <p>Payment Request for Ticket No: ${ticketNo} has been sent to User.</p>
            
            <p>Amount: <b>${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(asked_price)} /-
          </b></p>
            <p>Due Date: ${date} (3 Days from the Notice updated/ Payment requested dated)</p>          
            <p>Please ensure that the payment is made by the specified due date. If you encounter any issues during the payment process or if you have any questions regarding the invoice, feel free to reach out to our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b> . We are here to assist you.</p>
            ${signature}
            `,
      };

      transporter.sendMail(mailOptions);
      transporter.sendMail(sendEmailToAdmin);

    return res.status(200).json(ticketDetails);

  } catch (error) {
    res.status(500).json({
      error: true,
      message: "please provide correct information",
    });
  }
};

exports.uploadAskedDocs = async (req, res) => {
  try {
    let { ticketNo } = { ...req.params };
    let { title } = { ...req.body };

    if (!ticketNo || !title) {
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    const roleId = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );

    if (!roleId || !roleId.role_id || !roleId.role_id.equals(process.env.ROLE_USER)) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    var ticketData = await Tickets.findOne({
      user_id: req.user._id,
      ticketNo,
      status: "payment requested",
    });

    if(!ticketData){
      return res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    if (title == "otherDocuments") {
      let otherDocuments = ticketData?.otherDocuments;

        if (otherDocuments && Array.isArray(otherDocuments)) {
          otherDocuments = [...ticketData?.otherDocuments, ...req.files];
        } else {
          otherDocuments = req.files;
        }

        let ticketNewDetails = await Tickets.findOneAndUpdate(
          { user_id: req.user._id, ticketNo, status: "payment requested" },
          { $set: { otherDocuments: otherDocuments } },
          { new: true }
        ).populate("notice");

        return res.status(200).json(ticketNewDetails);
    }

      let documentRequested = ticketData?.documentRequested;

      if (documentRequested && Array.isArray(documentRequested)) {
        
        documentRequested = [...ticketData?.documentRequested];

        let currentDocumentIndex = documentRequested.findIndex(
          (el) => el.title == title
        );

        if (currentDocumentIndex > -1) {
          let updatedDocument = {
            ...documentRequested[currentDocumentIndex],
            document: req.files[0],
          };
          documentRequested[currentDocumentIndex] = updatedDocument;

          const ticketDetails = await Tickets.findOneAndUpdate(
            { user_id: req.user._id, ticketNo, status: "payment requested" },
            { $set: { documentRequested: documentRequested } },
            { new: true }
          ).populate("notice");

          return res.status(200).json(ticketDetails);
        } else {
          return res.status(400).json({
            error: true,
            message: "please provide correct information",
          });
        }
      } else {
        return res.status(400).json({
          error: true,
          message: "please provide correct information",
        });
      }

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "please provide correct information",
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    let { ticketNo } = { ...req.params };
    let { status } = { ...req.body };

    if (!ticketNo) {
      return res.status(400).json({
        error: true,
        message: "Ticket No not found.",
      });
    }

    const roleId = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );

    if (!roleId || !roleId.role_id) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    if (roleId.role_id == process.env.ROLE_USER) {
      let ticketDetails = await Tickets.findOne({
        user_id: req.user._id,
        ticketNo,
        status,
      }).populate("notice");

      if (!ticketDetails) {
        return res.status(400).json({
          error: true,
          message: "Data not found in tickets.",
        });
      }

      let ableToPay = true;

      if (
        ticketDetails.documentRequested &&
        Array.isArray(ticketDetails.documentRequested)
      ) {
        for (let i = 0; i < ticketDetails.documentRequested.length; i++) {
          if (
            ticketDetails.documentRequested[i]?.required &&
            (!ticketDetails.documentRequested[i]?.document ||
              !ticketDetails.documentRequested[i]?.document?.path)
          ) {
            ableToPay = false;
            break;
          }
        }
      }

      if (!ableToPay) {
        return res.status(400).json({
          error: true,
          message: "Document required.",
        });
      }

      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY,
      });

      const paymentOptions = {
        amount: ticketDetails?.asked_price * 100,
        currency: "INR",
        receipt: ticketNo + crypto.randomBytes(10).toString("hex"),
        notes: { ticketNo },
      };

      try {
        instance.orders.create(paymentOptions, async (error, order) => {
          if (error) {
            return res
              .status(500)
              .json({ error, message: "Something Went Wrong In Payment!" });
          } else {
            let paymentData = {
              user_id: req.user._id,
              reference_id: ticketDetails._id,
              amount: order.amount ? order.amount : paymentOptions.amount,
              currency: order.currency
                ? order.currency
                : paymentOptions.currency,
              receipt: order.receipt ? order.receipt : paymentOptions.receipt,
              orderId: order.id ? order.id : null,
              rzp_order_createdAt: order.created_at ? order.created_at : null,
              payment_status: order.status ? order.status : "initiated",
              created_by: req.user._id,
            };

            Payment.create(paymentData)
              .then(async (result) => {
                if (result) {
                  return res.status(200).json({
                    error: false,
                    order,
                    ticketDetails,
                    payment: result,
                    message: "payment initiated successfully.",
                  });
                } else {
                  res.status(400).json({
                    error: true,
                    status: 400,
                    message: "Unable to create payment.",
                  });
                }
              })
              .catch((error) => {
                res.status(400).json({
                  error: true,
                  errorMessage: error.message,
                  status: 400,
                  message:
                    "Please provide correct information to create payment.",
                });
              });
          }
        });
      } catch (paymentError) {
        return res.status(500).json({
          error: paymentError,
          message: "Something Went Wrong in payment!",
        });
      }
    } else {
      return res.status(401).json({
        error: true,
        message: "Unautherized role.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "please provide correct information",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      let payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { $set: { paymentId: razorpay_payment_id, payment_status: "success" } },
        { new: true }
      );

      let ticketDetails = await Tickets.findByIdAndUpdate(
        payment.reference_id,
        { $set: { status: "paid" } },
        { new: true }
      ).populate("notice");

      const userProfile = await profile.findOne({ user_id: req.user._id });
      const fullName = userProfile.fullName;
      const email = userProfile.email;
      let dateOption = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      let date = new Intl.DateTimeFormat("en-US", dateOption).format(
        new Date()
      );

      const paymentMailOptions = {
        from: process.env.INFO_EMAIL || "info@gstkanotice.com",
        to: email,
        subject: `Payment Successfully Processed for Ticket No: ${ticketDetails.ticketNo}`,
        html: `<p>Dear <b>${fullName}</b>,</p>
          <p>We hope this message finds you well. We are pleased to inform you that the payment for your recent request, associated with the ticket number <b>${
            ticketDetails.ticketNo
          }</b>, has been successfully processed.</p>
          
          <p><b>Payment Status:</b> Paid</p>
        <p><b> Amount:</b> ${new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(ticketDetails.asked_price)} /-</p>
          <p><b>Transaction ID:</b> ${razorpay_payment_id}</p>
          <p><b>Date and Time:</b> ${date}</p>
          
          <p>We appreciate your prompt attention to this matter, and we would like to thank you for choosing GST KA NOTICE. </p>
          
        <p> Your timely payment ensures the continued smooth operation of your services.</p>
          <p>If you have any further questions or require additional assistance, please do not hesitate to contact our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b>.</p>
          
          <p>Once again, thank you for your business, and we look forward to serving you in the future.</p>
          ${signature}
          `,
      };

      const sendEmailToAdmin = {
        from: process.env.INFO_EMAIL || "info@gstkanotice.com",
        to: process.env.INFO_EMAIL || "info@gstkanotice.com",
        subject: `Payment Successfully Processed for Ticket No: ${ticketDetails.ticketNo}`,
        html: `<p>Dear <b>Admin</b>,</p>
          <p>We are pleased to inform you that the payment associated with the ticket number <b>${
            ticketDetails.ticketNo
          }</b>, has been successfully processed.</p>
          
          <p><b>Payment Status:</b> Paid</p>
        <p><b> Amount:</b> ${new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(ticketDetails.asked_price)} /-</p>
          <p><b>Transaction ID:</b> ${razorpay_payment_id}</p>
          <p><b>Date and Time:</b> ${date}</p>          
          ${signature}
          `,
      };


      transporter.sendMail(paymentMailOptions);
      transporter.sendMail(sendEmailToAdmin);

      const caseNo = await generateUniqueNo("C");
      let data = {
        user_id: req.user._id,
        caseNo,
        ticket: ticketDetails._id,
        paymentID: payment._id,
        paid_amount: ticketDetails.asked_price,
        created_by: req.user._id,
      };

      Cases.create(data)
        .then(async (result) => {
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
           ${signature}
            `,
            };

            const sendEmailToAdmin = {
              from: process.env.INFO_EMAIL || "info@gstkanotice.com",
              to: process.env.INFO_EMAIL || "info@gstkanotice.com",
              subject: `Case Created Successfully - Case No: ${result.caseNo} for Ticket No: ${ticketDetails.ticketNo}`,
              html: `<p>Dear <b>Admin</b>,</p>

            <p>We trust this message finds you well. We would like to inform you that a case has been successfully created in response to your recent payment for the ticket number <b>${ticketDetails.ticketNo}</b>.</p>
            
            <p><b>Case Number:</b> ${result.caseNo}</p>
            
            <p>Our team is now reviewing the details of your case and will work diligently to provide you with a resolution. You can track the status and progress of your case at any time by logging into your account on our website and navigating to Cases under the Profile section.</p>
            
            <p>If you have any further inquiries or if there are specific details you would like to provide regarding your payment, please reply to this email with the case number  ${result.caseNo} in the subject line.</p>
            
            <p>We appreciate your cooperation and prompt attention to this matter. If you have additional questions or require assistance, please feel free to reach out to our support team at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b> . We are here to assist you.</p>
            
           <p> Thank you for choosing GST KA NOTICE. We value your trust and look forward to assisting you further.</p>
           ${signature}
            `,
            };
            

            transporter.sendMail(caseCreatedMailOptions);
            transporter.sendMail(sendEmailToAdmin);

            return res.status(200).json({
              error: false,
              status: 200,
              message: "Case created successfully",
              data: result,
            });
          } else {
            return res.status(400).json({
              error: true,
              status: 400,
              message: "Please provide correct information",
            });
          }
        })
        .catch((error) => {
          return res.status(400).json({
            error: true,
            errorMessage: error.message,
            status: 400,
            message: "Please provide correct information",
          });
        });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
};

exports.failedPayment = async (req, res) => {
  try {
    const { metadata } = req.body;

    await Payment.findOneAndUpdate(
      { orderId: metadata.order_id },
      { $set: { error: req.body, payment_status: "failed" } },
      { new: true }
    );

    return res.status(200).json({ message: "Payment updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
};

exports.removeOtherDocuments = async (req, res) => {
  try {
    let { ticketNo } = { ...req.params };
    let { otherDocuments } = { ...req.body };

    if (!otherDocuments || !ticketNo) {
      res.status(400).json({
        error: true,
        message: "please provide correct information",
      });
    }

    const roleId = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );

    if (!roleId || !roleId.role_id) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    if (roleId.role_id == process.env.ROLE_USER) {
      if (Array.isArray(otherDocuments)) {
        let ticketNewDetails = await Tickets.findOneAndUpdate(
          { user_id: req.user._id, ticketNo, status: "payment requested"},
          { $set: { otherDocuments: otherDocuments } },
          { new: true }
        ).populate("notice");

        return res.status(200).json(ticketNewDetails);
      } else {
        return res.status(400).json({
          error: true,
          message: "please provide correct information",
        });
      }
    } else {
      return res.status(401).json({
        error: true,
        message: "Unautherized role.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "please provide correct information",
    });
  }
};

exports.getAllTicketsForDashboard = async (req, res) => {
  try {
    const roleId = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );

    if (!roleId || !roleId.role_id) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    let allTickets = await Tickets.find()  
    .sort({ createdAt: -1 })  // Sort in descending order of createdAt (latest first)
    .limit(5);
    const uniqueUserIds = Array.from(
      new Set(allTickets.map((ticket) => ticket.user_id.toString()))
    );
    // Fetch user data from the 'profile' collection based on unique user IDs
    const userData = await profile.find({ user_id: { $in: uniqueUserIds } });

    // Create a mapping of user ID to user data for easy lookup
    const userMap = {};
    userData.forEach((user) => {
      userMap[user.user_id.toString()] = user;
    });
    // Now, update each ticket with the corresponding user data
    allTickets = allTickets.map((ticket) => {
      const userData = userMap[ticket.user_id.toString()];
      return {
        ...ticket.toObject(),
        user_data: userData, // Add user_data field to the ticket with the corresponding user data
      };
    });

    return res.status(200).json(allTickets);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "please provide correct information",
    });
  }
};
