const generateUniqueNo = require('../../services/generateUniqueNo')
const Tickets = require('../../models/tickets'); // Import your tickets model

exports.createTicket = async (req, res) => {
    try{
        const ticketNo = await generateUniqueNo('T')
        let data = { ...req.body, user_id:req.user._id, created_by:req.user._id, ticketNo, document: req.files.document[0]};

        Tickets.create(data).then((result)=>{
          if (result) {
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