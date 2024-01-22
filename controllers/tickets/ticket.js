const UserRole = require('../../models/user_roles')
const Tickets = require('../../models/tickets')

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
            let allTickets = await Tickets.find({user_id:req.user._id}).populate('notice');
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
          let ticketData = await Tickets.findOne({user_id:req.user._id,ticketNo,'status':'Payment Pending'});
          let documentRequested = [...ticketData?.documentRequested];

          if(documentRequested && Array.isArray(documentRequested)){
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
