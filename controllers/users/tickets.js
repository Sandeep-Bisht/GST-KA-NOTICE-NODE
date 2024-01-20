exports.createTicket = async (req, res) => {
    try{
        return res.status(200).json({'message':"create ticket called", 'user':req.user._id})
        // console.log(req.body,'create ticket called')
        // await Notices.find().populate('service').then((result)=>{
        //   if(result && result.length>0)
        //   {
        //     res.status(200).json(result)
        //   }
        //   else{
        //     res.status(400).json({
        //       error:true,
        //       message:"please provide correct information",
        //     })
        //   }
        // })
      }
      catch(error){
        res.status(500).json({
          error:true,
          message:"please provide correct information"
        })
      }
}