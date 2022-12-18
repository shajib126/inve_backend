const Product = require('../models/product')
const { fileSizeFormatter } = require('../utils/fileUpload')

const cloudinary = require('cloudinary').v2

exports.createProduct = async(req,res)=>{
    const {name,sku,category,quantity,price,description} = req.body 
    if(!name || !sku || !category || !quantity || !price || !description){
        res.status(400).json({
            success:false,
            message:'Please fill in all fields'
        })
    }

    let fileData = {}
    if(req.file){
        let uploadedFile
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path,{
                folder:"Pinvent App",
                resource_type:"image"
            })
        } catch (error) {
           res.status(500).json({
            success:false,
            message:error
           }) 
        }
        fileData ={
            fileName:req.file.originalname,
            filePath:uploadedFile.secure_url,
            fileType:req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)
        }
    }
    const product = await Product.create({
        user:req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image:fileData
    })
    res.status(201).json(product)
}

exports.getProducts = async(req,res)=>{
    const products = await Product.find({user:req.user.id}).sort("-createdAt")
    res.status(200).json(products)
}


//get single product
exports.getProduct = async(req,res)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        res.status(404).json({
            success:false,
            message:"product not found"
        })
    }
    if(product.user.toString() !== req.user.id){
        res.status(401).json({
            success:false,
            message:"user not authorized"
        })
    }
    res.status(200).json(product)
}


//delete product

exports.deleteProduct = async(req,res)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        res.status(404).json({
            success:false,
            message:'product not found'
        })
    }
    if(product.user.toString() !== req.user.id){
        res.status(401).json({
            success:false,
            message:"user not authorized"
        })
    }
    await product.remove()
    res.status(200).json({success:true,message:"Product Deleted"})
}

//update product
exports.updateProduct = async(req,res)=>{
    const {name,category,quantity,price,description} = req.body 
    const product = await Product.findById(req.params.id)
    if(!product){
        res.status(404).json({
            success:false,
            message:'product not found'
        })
    }
    if(product.user.toString() !== req.user.id){
        res.status(401).json({
            success:false,
            message:"user not authorized"
        })
    }
    let fileData = {}
    if(req.file){
        let uploadFile 
        try {
            uploadFile = await cloudinary.uploader.upload(req.file.path,{
                folder:"Pinvent App",
                resource_type:"image"
            })
        } catch (error) {
            res.status(500).json({
                success:false,
                message:error
            })
        }
        fileData = {
            fileName:req.file.originalname,
            filePath:uploadedFile.secure_url,
            fileType:req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)
        }
    }
    const updatedProduct = await Product.findByIdAndUpdate({_id:req.params.id},{name,category,quantity,price,description,image:Object.keys(fileData).length === 0 ? product?.image : fileData},{new:true,runValidators:true})
    res.status(200).json(updatedProduct)
}