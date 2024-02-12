const Queries = require("../../models/queries");

module.exports={
  
  create: async (req, res) => {
    try {
      let data = { ...req.body };
  
      Queries.create(data).then((result)=>{
        if (result) {
          res.status(200).json({
            status: 200,
            message: "query submitted successfully",
          });
        } else {
          res.status(400).json({
            status: 400,
            message: "Please provide correct information"
          });
        }
      }).catch((error)=>{
        res.status(400).json({
          status: 400,
          message: "Please provide correct information"
        });
      })

    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },  

  get_all_queries:async(req,res)=>{
    try{
      await Queries.find().then((result)=>{
        if(result && result.length>0)
        {
          res.status(200).json({
            error: false,
            message:"get all queries",
            data:result
          })
        }
        else{
          res.status(400).json({
            error:true,
            message:"please provide correct information",
          })
        }
      })
    }
    catch(error){
      res.status(500).json({
        error:true,
        message:"please provide correct information"
      })
    }

  }
  
}