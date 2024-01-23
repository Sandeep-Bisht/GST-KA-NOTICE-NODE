const Blog = require('../../../models/blogs')
const Category = require('../../../models/blogsCategories')

module.exports = {
    create : async(req,res) => {
        try {
            let data = { ...req.body,created_by:req.user._id, featuredImage: req.files};    
            if((data.tags || !Array.isArray(data.tags ) && data.tags !== '')){
              data.tags = data.tags.split(',');
            }
            else{
              data.tags = []
            }

            
            Blog.create(data).then((result)=>{
              if (result) {
                res.status(200).json({
                  error:false,
                  status: 200,
                  message: "Blog created successfully",
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
    },
    get_all_blog : async(req,res) => {
        try {
            Blog.find().populate("category").then((result)=> {
                if(result){
                    res.status(200).json({
                        error : false,
                        message : "Data found",
                        data : result
                    })
                } else {
                    res.status(400).json({
                        error : true,
                        message : "Something went wrong"
                    })
                }
            }).catch((error)=>{
                res.status(400).json({
                    error:true,
                    message :"Somthing went wrong"
                })
            })
        } catch (error) {
            res.status(400).json({
                error : false,
                message : "Please provide correct information"
            })
        }
    },
    get_blog_by_id : async(req,res) => {
        const {_id} = req.body;
        try{
           await Blog.findById(_id).populate("category").then((result)=>{
              if(result!==null)
              {
                res.status(200).json({
                    error:false,
                    message:"Data Found",
                    data:result
                })
              }else{
                res.status(400).json({
                    error:true,
                    message:"Data not found"
                })
              }
           })
        }catch(error){
            res.status(500).json({
                error:true,
                message:"Something went wrong, please try again later."
            })
        }
    },


    create_categorie : async(req, res) => {
        try {
            let data = { ...req.body,created_by:req.user._id, featuredIcon: req.files[0]};
            
            Category.create(data).then((result)=>{
              if (result) {
                res.status(200).json({
                  error:false,
                  status: 200,
                  message: "blog category created successfully",
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
    },

    get_all_blog_categories : async(req, res) => {
        try{
            await Category.find().then((result)=>{
                if(result.length>0)
                {
                    res.status(200).json({
                        error:false,
                        message:"data found",
                        data:result,
                    })
                }
                else{
                    res.status(400).json({
                        error:true,
                        message:"data not found",
                    })
                }
            });
           }catch(error){
            res.status(500).json({
                error: true,
                message: "Please provide correct information"
            });
           }
    },

    getBlogCategoryById : async (req, res)=>{
        const {category_id} = {...req.params};
        try{
         const category = await Category.findById(category_id)
         if(category)
         {
         res.status(200).json({
          error:false,
          message:"data found",
          data:category
         })
      }
      else{
          res.status(400).json({
              error:true,
              message:"data not found",
          })
      }
        }catch(error){
          res.status(500).json({
             error:true,
             message: "Please provide correct information"
          })
        }
     },
  
}