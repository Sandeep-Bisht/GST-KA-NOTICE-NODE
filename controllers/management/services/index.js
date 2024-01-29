const Services = require('../../../models/services')

exports.getAllServices = async (req, res) => {
    try{
        await Services.find().then((result)=>{
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

exports.createService = async (req, res) => {
    try {
        let data = { ...req.body, created_by:req.user._id, featuredImage: req.files.featuredImage[0], featuredIcon: req.files.featuredIcon[0]};
    
        Services.create(data).then((result)=>{
          if (result) {
            res.status(200).json({
              error:false,
              status: 200,
              message: "Service created successfully",
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
            status: 400,
            message: "Please provide correct information"
          });
        })
  
      } catch (error) {
        res.status(500).json({errorMessage:error.message,error:true, message: 'Internal server error' });
      }
}

exports.deleteServiceById = async (req, res) => {
  try {
    let {_id} = req.params._id;

    let deleteService = await Services.findByIdAndDelete({_id});

    if(!deleteService){
      return res.status(404).json({
        error: true,
        message: 'Service not found.',
      })
    }

    return res.status(200).json({
      error : false,
      message: 'Service deleted successfully'
    })
    
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error deleting Service.',
    })
  }
}

exports.updateServiceById = async (req, res) => {
  
    let {_id} = req.params;
    let data = { ...req.body}
    delete data.featuredImage;
  delete data.featuredIcon;
    
    if(req.files){
      try {
        if (req.files &&  req.files.updatedFeaturedImage.length > 0) {
          let featuredImage = req.files.updatedFeaturedImage.find((item) => item.fieldname == 'updatedFeaturedImage');
          if (featuredImage){
           
            data = { ...data, featuredImage: featuredImage };
          } 
        }
        if (req.files &&  req.files.updatedFeaturedIcon.length > 0) {
          let featuredIcon = req.files.updatedFeaturedIcon.find((item) => item.fieldname == 'updatedFeaturedIcon');
          if (featuredIcon){
           
            data = { ...data, featuredIcon: featuredIcon };
          } 
        }
      } catch (uploadError) {
        return res.status(500).json({
          error: true,
          message: "Error uploading files.",
        });
      }
    }
    try{
      await Services.findByIdAndUpdate(_id,data).then((result)=>{
          if(result){
              res.status(200).json({
                  error:false,
                  message:"Service updated Successfully"
              })
          }else{
              res.status(400).json({
                  error:true,
                  message:"Error updating Service"
              })
          }
        })
    }catch(error){
       res.status(500).json({
          error:true,
          message:"Something went wrong, please try again later."
       })
    }

  
}

exports.getServicesById = async (req, res) => {
  try {
    let {_id}  = req.params;

    await Services.findById(_id).then(((result) =>{
      if(result!==null) {
        res.status(200).json({
          error:false,
           message:"No Data Found",
           data:result
        })
      }else{
        res.status(400).json({
          error:true,
          message:"Data not found"
      })
      }
    }))
  } catch (error) {
    res.status(500).json({
      error:true,
      message:"Something went wrong"
    })
  }
}