const Notices = require('../../../models/notices')

exports.getAllNotices = async (req, res) => {
    try{
      await Notices.find()
      .populate('service')
      .sort({ starting_price: 1 })
      .then((result) => {
        if (result && result.length > 0) {
          // Convert starting_price to numbers
          result.forEach((notice) => {
            notice.starting_price = parseInt(notice.starting_price);
          });
    
          // Sort the array based on starting_price
          result.sort((a, b) => a.starting_price - b.starting_price);
    
          res.status(200).json(result);
        } else {
          res.status(400).json({
            error: true,
            message: "No Data found",
          });
        }
      }).catch((error) => {
        // Handle any errors that occurred during the database query
        res.status(500).json({
          error: true,
          message: "Internal Server Error",
        });
      });
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
        let data = { ...req.body,created_by:req.user._id,featuredImage: req.files.featuredImage[0], featuredIcon: req.files.featuredIcon[0]};

        if((data.tags || !Array.isArray(data.tags ) && data.tags !== '')){
          data.tags = data.tags.split(',');
        }
        else{
          data.tags = []
        }
        
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

exports.getNoticeBySeoTitle = async (req, res) => {  
  try{
    let {seo_title} = {...req.params};
      await Notices.findOne({seo_title}).populate('service').then((result)=>{
        if(result)
        {
          res.status(200).json(result)
        }
        else{
          res.status(400).json({
            error:true,
            message:"No Data found",
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