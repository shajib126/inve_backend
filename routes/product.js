const router = require('express').Router()
const { createProduct, updateProduct, getProducts, getProduct, deleteProduct } = require('../controller/product')
const protect = require('../middlewares/auth')
const { upload } = require('../utils/fileUpload')

router.post("/",protect,upload.single("image"),createProduct)
router.patch("/:id",protect,upload.single("image"),updateProduct)
router.get('/',protect,getProducts)
router.get('/:id',protect,getProduct)
router.delete("/:id",protect,deleteProduct)

module.exports = router