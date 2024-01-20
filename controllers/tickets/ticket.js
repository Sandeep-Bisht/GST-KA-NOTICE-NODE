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
