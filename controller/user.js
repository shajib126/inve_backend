const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/token");
const crypto =require('crypto');
const sendEmail = require("../utils/sendMail");

//generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "password must be greater than six charecters",
      });
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400).json({
        success: false,
        message: "user already registered",
      });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
    });
    if (user) {
      const { _id, name, email, photo, phone, bio } = user;
      res.status(201).json({
        _id,
        name,
        email,
        photo,
        phone,
        bio,
        token,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

//Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      res.status(400).json({
        success: false,
        message: "Add email and password",
      });
    }

    const user = await User.findOne({ email });
    const matchPassword = await bcrypt.compare(password, user.password);
    if (matchPassword) {
      const token = generateToken(user._id);
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 + 86400),
      });

      res.status(200).json({
        user,
        token
      });
    }
    res.status(400).json({
      success: false,
      message: "Incorrect password",
    });
  } catch (error) {}
};


//Logout
exports.logout = async (req, res) => {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({ message: "Successfully Logged Out" });
  };

  //get user data

  exports.getUser = async(req,res)=>{
    const user = await User.findById(req.user._id)
    res.status(200).json({
        success:true,
        user
    })
  }

  // Get Login Status
exports.loginStatus = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.json(false);
    }
    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
      return res.json(true);
    }
    return res.json(false);
  };

exports.updateUser = async(req,res)=>{
    const user = await User.findById(req.user._id)
    if(user){
        const {name,email,photo,phone,bio} = user;
        
        user.email = req.body.email || email
        user.name = req.body.name || name
        user.photo = req.body.photo || photo
        user.phone = req.body.phone || phone
        user.bio = req.body.bio  || bio
        const updateUser = await user.save()
        res.status(200).json({
            message:'updated',
            updateUser
        })
    }else{
        res.status(404).json({
            success:fasle,
            message:'user not found'
        })
    }
}

//change password
exports.changePassword = async(req,res)=>{
    const user = await User.findById(req.user._id)
    const {oldPassword,password} = req.body
    if(!user){
        res.status(404).json({
            success:false,
            message:'user not found'
        })
    }
    if(!oldPassword || !password){
        res.status(400).json({
            success:fasle,
            message:"Please, Add old and new password"
        })
    }
    const passwordIsCorrect = await bcrypt.compare(oldPassword,user.password)
    if(user && passwordIsCorrect){
        user.password = password
        await user.save()
        res.status(200).json({
            success:true,
            message:"Password changed"
        })
    }else{
        res.status(400).json({
            success:false,
            message:'password is incorrect'
        })
    }
}

//forgot password

exports.forgotPassword = async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        res.status(404).json({
            success:false,
            message:"User not found"
        })
    }
    let token = await Token.findOne({userId:user._id})
    if(token){
        await token.deleteOne()
    }
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    await new Token({
        userId:user._id,
        token:hashedToken,
        createdAt:Date.now(),
        expiresAt:Date.now()+30*(60*1000)
    }).save()
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>  
    <p>This reset link is valid for only 30minutes.</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    <p>Regards...</p>
    <p>Pinvent Team</p>
  `;
    const subject = "Password Reset Request"
    const send_to = "user.email"
    const sent_from = process.env.EMAIL_USER
  try {
    await sendEmail(subject,send_to,message,sent_from)
    res.status(200).json({success:true,message:"Reset Email sent"})
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error
    })
  }
    
}

 exports.resetPassword = async(req,res)=>{
  const {password} = req.body
  const {resetToken} = req.paramas

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
  const userToken = await Token.findOne({
    token:hashedToken,
    expiresAt:{$gt:Date.now()}
  })
  if(!userToken){
    res.status(404).json({
      success:false,
      message:"Invalid or Expire Token"
    })
  }
  const user = await User.findOne({_id:userToken.userId})
  user.password = password
  await user.save()
  res.status(200).json({
    message:"Password Reset Successful, Please login"
  })
}