//const mongoose = require("mongoose");
const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const mailUtil = require("../utils/MailUtil");
const jwt = require("jsonwebtoken");
const secret = "secret";

const loginUser = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  const foundUserFromEmail = await userModel.findOne({ email: email }).populate("roleId");
  console.log(foundUserFromEmail);

  if (foundUserFromEmail != null) {
    const isMatch = bcrypt.compareSync(password, foundUserFromEmail.password);

    if (isMatch == true) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: foundUserFromEmail._id,
          email: foundUserFromEmail.email,
          role: foundUserFromEmail.roleId?.name || 'user'
        },
        secret,
        { expiresIn: '24h' }
      );
      
      res.status(200).json({
        message: "login success",
        data: foundUserFromEmail,
        token: token
      });
    } else {
      res.status(404).json({
        message: "invalid credentials",
      });
    }
  } else {
    res.status(404).json({
      message: "email not found...",
    });
  }
};

const signup = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hashedPassword;

    const createdUser = await userModel.create(req.body);
    await mailUtil.sendingMail(createdUser.email,"Registration Successfull","Thank you for registering with us");

    res.status(201).json({
      message: "user created..",
      data: createdUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error",
      data: err,
    });
  }
};

const addUser = async (req, res) => {
  const savedUser = await userModel.create(req.body);
  res.json({
    message: "user created...",
    data: savedUser,
  });
};

const getAllUsers = async (req, res) => {
  const users = await userModel.find().populate("roleId");
  res.json({
    message: "user fetched successfully",
    data: users,
  });
};

const deleteUserById = async (req, res) => {
  const deletedUser = await userModel.findByIdAndDelete(req.params.id);
  res.json({
    message: "user deleted Successfully..",
    data: deletedUser,
  });
};

const getUserById = async (req, res) => {
  try {
    const foundUser = await userModel.findById(req.params.id);
    
    if (!foundUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    res.status(200).json({
      message: "user fetched successfully..",
      data: foundUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      message: "Error fetching user",
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  const email = req.body.email;
  const foundUser = await userModel.findOne({ email: email });

  if (foundUser) {
    const token = jwt.sign(foundUser.toObject(), secret);
    console.log(token);
    const url = `http://localhost:5173/resetpassword/${token}`;
    const mailContent = `<html>
                          <a href ="${url}">reset password</a>
                          </html>`;
    //email...
    await mailUtil.sendingMail(foundUser.email, "reset password", mailContent);
    res.json({
      message: "reset password link sent to mail.",
    });
  } else {
    res.json({
      message: "user not found register first..",
    });
  }
};

const resetpassword = async (req, res) => {
  const token = req.body.token; //decode --> email | id
  const newPassword = req.body.password;

  const userFromToken = jwt.verify(token, secret);
  //object -->email,id..
  //password encrypt...
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword,salt);

  const updatedUser = await userModel.findByIdAndUpdate(userFromToken._id, {
    password: hashedPassword,
  });
  res.json({
    message: "password updated successfully..",
  });
};

const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    if (updateData.password) {
      delete updateData.password;
    }
    
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    
    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      message: "Error updating user",
      error: error.message
    });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId).populate("roleId");
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    res.status(200).json({
      message: "User info retrieved successfully",
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        roleId: {
          name: user.roleId?.name || 'user'
        }
      }
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      message: "Error retrieving user info",
      error: error.message
    });
  }
};

/**
 * Update user password with current password verification
 */
const updatePassword = async (req, res) => {
  try {
    // Get userId from token instead of request body
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Missing required fields: currentPassword, newPassword"
      });
    }
    
    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // Verify current password
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }
    
    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      message: "Error updating password",
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  addUser,
  deleteUserById,
  getUserById,
  updateUserById,
  signup,
  loginUser,
  forgotPassword,
  resetpassword,
  getUserInfo,
  updatePassword
};
