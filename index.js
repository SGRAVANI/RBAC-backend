import express from "express"
import dotenv from "dotenv"
import createHttpError from "http-errors"
import mongoose from "mongoose"
//import indexRouter from "./routes/index.route.js"
import authRoute from "./routes/auth.route.js"
import cors from "cors"
import userRoute from "./routes/user.route.js"
 // import passport from "passport"

import adminRouter from "./routes/admin.route.js"
import courseRouter from "./routes/course.route.js"
import fileupload from "express-fileupload"
import bodyParser from "body-parser";
let app=express()
dotenv.config()
app.use(cors( {origin: "http://localhost:5173", // Your React app's URL
    credentials: true}))
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


import cookieParser from "cookie-parser"


const port=process.env.PORT
//app.use("/",indexRouter)

// app.use((req, res, next) => {
//     console.log("Session data:", req.session);
//     console.log("Logged-in user:", req.user); // req.user is populated by passport.session()
//     next();
// });
app.use(fileupload({
    useTempFiles:true,
    limits: { fileSize: 10 * 1024 * 1024 } 
}))
app.use("/auth",authRoute)
app.use("/user",userRoute)
app.use("/admin",adminRouter)
app.use("/course",courseRouter)
app.use((req,res,next)=>{
    next(createHttpError.NotFound())
})

app.use((error,req,res,next)=>{
    if (res.headersSent) {
        // If headers are already sent, delegate to default Express error handler
        return next(error);
    }
    error.status=error.status||500
    res.status(error.status)
    // res.send(error)

     res.status(error.status).json({"message":"Internal server error","status":500})
})
app.listen(port,async ()=>{
    console.log("app is listening on port :",port)
    try{
  //  const conInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
    const conInstance=await mongoose.connect(`${process.env.MONGODB_URI}`)
   // console.log(conInstance)
    console.log("connected")
    }
    catch(e)
    {
        console.log("error occured in connectivity",e.message)
       process.exit(1)
    }
})
