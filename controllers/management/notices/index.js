const Notices = require('../../../models/notices')

exports.getAllNotices = async (req, res) => {
    try{
        await Notices.find().then((result)=>{
          if(result && result.length>0)
          {
            res.status(200).json(result)
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

exports.createNotice = async (req, res) => {
    try {

        let data = { ...req.body,featuredImage: req.files.featuredImage[0]};
    
        Notices.create(data).then((result)=>{
          if (result) {
            res.status(200).json({
              error:false,
              status: 200,
              message: "Notice created successfully",
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
  
      } catch (error) {
        res.status(500).json({error:true, message: 'Internal server error' });
      }
}