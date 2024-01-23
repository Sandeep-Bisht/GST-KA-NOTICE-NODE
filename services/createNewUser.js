// user, role, prfile These fields are required where user content user collection data.
// Like in user we can pass a object with username usertypen and othe thing which will be stored in users collection.
// role filed contained role name of user if null or undefine then role will be ser user default.
// profile contained profie table data like name email phone and other fields.

const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Import your User model
const Profile = require('../models/profile'); // Import your Profile model
const Role = require('../models/roles'); // Import your Role model
const UserRoles = require('../models/user_roles'); // Import your Role model

const createNewUser = async (data) => {
  try {

    const { user, role, profile } = data;

    if (!role) {
      role = 'user';
    }

    const userResult = await User.create(user);
    if (!userResult) {
      return {
        error: true,
        status: 500,
        message: 'Error creating new user .',
      };
    }

    const roleID = await Role.findOne({role});

    if(!roleID){
      return {
        error: true,
        status: 500,
        message: 'Role not found .',
      };
    }

    const roleResult = await UserRoles.create({ user_id: userResult._id, role_id: roleID._id });

    if (!roleResult) {
      return {
        error: true,
        status: 500,
        message: 'Error assigning role .',
      };
    }


    const profileData = { ...profile, user_id: userResult._id };
    const profileResult = await Profile.create(profileData);

    if (!profileResult) {
      return {
        error: true,
        status: 500,
        message: 'Error creating profile .',
      };
    }

    const token = jwt.sign({ userID: userResult._id,role:roleID._id }, process.env.JWT_KEY || "guyr7fyudurdtyidyditdrciyfxcftgdxirx", { expiresIn: '30d' });

    return {
      error: false,
      status: 201,
      token: token,
      message: 'User created successfully !',
    };
    
  } catch (error) {
    return {
      errorMessage:error.message,
      error: true,
      status: 500,
      message: 'Error creating new user.',
    };
  }
};

module.exports = createNewUser;
