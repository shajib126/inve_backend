const User = require("../models/user")

exports.contactUs = async(req,res)=>{
    const {subject,message} = req.body
    const user = await User.findById(req.user._id)
    if(!user){
        res.status(400).json({
            success:false,
            message:"user not found"
        })
    }
    if(!user || !message){
        res.status(400).json({
            success:false,
            message:"Please add subject and message field"
        })
    }
    
  const send_to = process.env.EMAIL_USER;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = user.email;

  try {
    await sendEmail(subject, message, send_to, sent_from, reply_to);
    res.status(200).json({ success: true, message: "Email Sent" });
  } catch (error) {
    res.status(500).json({
        success:false,
        message:"Email not sent,please try again"
    })
  }
}