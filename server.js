const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser")
const userRoutes = require('./routes/user')
const productRouter = require('./routes/product')
const contactRouter = require('./routes/contact')
const app = express()


dotenv.config()
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

//routes middleware
app.use('/api/user',userRoutes)
app.use('/api/product',productRouter)
app.use('/api/contact',contactRouter)

//server running
mongoose.set('strictQuery',true)
mongoose.connect(process.env.DB_URL).then(()=>console.log(`DB connected in ${mongoose.connection.host}`)).catch((err)=>{
    console.log(err)
})
const port = process.env.PORT
app.listen(port,()=>console.log(`server running in ${port}`))




