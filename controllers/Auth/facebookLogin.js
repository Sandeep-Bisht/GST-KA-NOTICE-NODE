var jwt = require('jsonwebtoken');
let users = require('../../models/users');
const axios = require('axios');
const createNewUser = require('../../services/createNewUser')
const UserRoles = require('../../models/user_roles')

exports.facebookSignup = (req, res) => {
    try{
        const { userID, accessToken } = req.body

        if(userID && accessToken){
              axios.get(`https://graph.facebook.com/${userID}?fields=id,name,email,picture&access_token=${accessToken}`)
              .then((response) => {
                if (response.status === 200) {
                  const userData = response.data;
                  users.findOne({facebookID: userData.id })

                  .then(async(result)=>{
                    if(result){
                      try{
                        let roleId = await UserRoles.findOne({ user_id: result._id });
                        let token = jwt.sign({userID:result._id,role:roleId.role_id},process.env.JWT_KEY || "guyr7fyudurdtyidyditdrciyfxcftgdxirx",{ expiresIn: "30d" })
                        return res.status(200).json({
                                          error: false,
                                          token: token,
                                          message: "User logged in successfully!",
                                        });
                      }
                      catch(error){
                        res.status(400).json({
                          error:true,
                          message: "Error Creating user token.",
                        });
                      }
                        
                    }
                    else{
    
                        let newUserData = {
                          user:{usertype:'facebook',facebookID: userData.id},
                          role:'user',
                          profile:{fullName:userData.name,usertype:'facebook'}
                        }

                        createNewUser(newUserData).then((response)=>{
                            return res.status(response.status).json(response);
                        })
                        .catch((error)=>{
                          res.status(400).json({
                            error:true,
                            message: "Error creating new user.",
                          });
                        })

                    }
                  })
                  .catch((err)=>{
                    res.status(400).json({
                        error:true,
                        message: "Error Finding user.",
                      });
                  });

                } else {
                    return res.status(response.status).json({
                        error:true,
                        message:"Unexpected response status."
                    })
                }
              })
              .catch((error) => {
                if (error.response) {
                    return res.status(error.response.status).json({
                        error:true,
                        message:"Unable to get User data from facebook."
                    })
                } else {
                    return res.status(400).json({
                        error:true,
                        message: "Error finding user on facebook.",
                      });
                }
              });

        }
        else{
            res.status(400).json({
                error:true,
                message:"User access token and UserId required."
            })
        }
    }
    catch(err){
        res.status(500).json({
            error:true,
            message:"Something went wrong please try again later."
        })
    }
}
