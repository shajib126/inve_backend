const jwt = require('jsonwebtoken')
const User = require('../models/user')
const protect = async(req,res,next)=>{
    const token = req.cookies.token
    if(!token){
        res.status(401).json({
            success:false,
            message:'Not authorized, please login'
        })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if(!user){
        res.status(401).json({
            success:false,
            message:'user not found'
        })
    }
    req.user = user
    next()
}

module.exports = protect