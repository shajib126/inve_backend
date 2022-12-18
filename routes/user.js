const router = require('express').Router()
const { registerUser, loginUser, logout, getUser, updateUser, changePassword, forgotPassword, resetPassword } = require('../controller/user')
const protect = require('../middlewares/auth')

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/update',protect,updateUser)
router.post('/changePassword',protect,changePassword)
router.post('/forgotpassword',forgotPassword)
router.put('/resetpassword',resetPassword)
router.get('/logout',logout)
router.get('/me',protect,getUser)
module.exports = router