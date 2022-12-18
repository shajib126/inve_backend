
const router = require('express').Router()
const { contactUs } = require('../controller/contact')
const protect = require('../middlewares/auth')

router.post('/',protect,contactUs)


module.exports = router