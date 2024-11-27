import express from "express"
let authRoute=express.Router()
import user from "../models/user.model.js"
import bcrypt from "bcrypt"
import {validationResult,body} from "express-validator"
import passport from "passport"
import jwt from "jsonwebtoken"
import {getUserDataFromCookie} from "../middleware/authData.middleware.js" 
const generateToken=async function(id,user)
{
    try{
    const payload={_id:user._id,username:user.email}
    return jwt.sign(payload,process.env.AUTH_TOKEN_SECRET,{expiresIn:process.env.AUTH_TOKEN_EXPITY})
    }
    catch(e)
    {
        return null
    }

}
// async function getUser(token)
// {   try{
    
//     if(!token)
// {
//     return null
// }
//     let data=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
//     let userData=await user.findById(data._id)
//     if(userData)
//     {
//         return userData
//     }
//     else{
//         return null
//     }
// }
// catch(e)
// {
//     return null
// }
// }
const checkErrors= async (req, res, next) => {
            const errors = validationResult(req);
            
        if (!errors.isEmpty()) {
                errors.array().forEach(er=>{
        res.status(400).json({message:er.msg,status:400})
    })
    return
               } 
            else{
                next()
            }
            }



authRoute.post(
    "/login",
    [
        body('username')
            .trim()
            .isEmail()
            .withMessage('email should be a valid email address')
            .normalizeEmail()
            .toLowerCase(),
        body('password')
            .trim()
            .isLength({ min: 8 })
            .withMessage("Minimum 8 characters are required for password")
    ],checkErrors,getUserDataFromCookie,
   async (req,res,next)=>{
   console.log(req.user)
     
    if(!req.user)
    {
        let {username,password}=req.body
        let getUserByEmail=await user.findOne({email:username})
         
        console.log(getUserByEmail)
        if(!getUserByEmail)
            {
               return res.status(401).json({message:"Username/Email not Registered!!!",status:400})
                
                //"username/email does not exist"
            // return res.status(400).json({message:"Email does not exist!!!",status:400})
            }
            if(getUserByEmail.status=='INACTIVE')
            {
                return res.status(403).json({message:"Oops, Your Account is blocked, contact admin@rbac.com for futher inquiry!!!",status:400})
            }
            const cookieOptions = {
                httpOnly: true,
            secure: true, // Set to true if using HTTPS
            path: '/',
            sameSite: 'strict' ,
            maxAge: 15 * 24 * 60 * 60 * 1000
              // expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)  // 15 days from now
            };
            
            const isMatch=await getUserByEmail.verifyPassword(password)
            console.log(isMatch)
            if(isMatch)
            {
                let userData=await user.findById(getUserByEmail._id).select("-password")
                let token=await generateToken(getUserByEmail._id,getUserByEmail)
                // return res.status(200).cookie("authToken",token,cookieOptions).json({message: "Login successful",user:getUserByEmail,status:200})
                return res
                .status(200)
                .cookie("authToken", token, cookieOptions)
                .json({ message: "Login successful", user: userData, status: 200 });
            
             // return done(null,getUserByEmail)
            }
            else{
                return res.status(401).json({message:"Incorrect Password",status:400})
            }
            
    }
    else{
        return res.status(401).json({message:"Incorrect Password",status:400})
       }
   }
);



// authRoute.post(
//     "/login",
//     [
//         body('username')
//             .trim()
//             .isEmail()
//             .withMessage('email should be a valid email address')
//             .normalizeEmail()
//             .toLowerCase(),
//         body('password')
//             .trim()
//             .isLength({ min: 8 })
//             .withMessage("Minimum 8 characters are required for password")
//     ],
//     async (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 message: "Validation failed",
//                 status: 400,
//                 errors: errors.array(),
//             });
//         }

//         passport.authenticate('local', (err, user, info) => {
//             if (err) return next(err);
//             if (!user) {
//                 return res.status(400).json({
//                     message: info?.message || "Invalid credentials",
//                     status: 400,
//                 });
//             }

//             req.login(user, (err) => {
//                 if (err) return next(err);
//                 console.log(req.user);
//                 res.cookie(token,generateToken())    
//                 res.status(200).json({ message: "Login successful", user });
//                // res.redirect("/user/profile")
//             });
//         })(req, res, next);
//     }
// );







// authRoute.post(
//     "/login",
//     [
//         body('username')
//             .trim()
//             .isEmail()
//             .withMessage('email should be a valid email address')
//             .normalizeEmail()
//             .toLowerCase(),
//         body('password')
//             .trim()
//             .isLength({ min: 8 })
//             .withMessage("Minimum 8 characters are required for password")
//     ],
//     async (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//                 errors.array().forEach(er=>{
//         res.status(400).json({message:er.msg,status:400})
//     })
//     return

//         }

//         passport.authenticate('local', (err, user, info) => {
//             if (err) return next(err);
//             if (!user) {
//                 //console.log(info.message)
//                  res.status(400).json({ message: info.message || "Invalid credentials",status:400 });
                 
//             }
//             req.login(user, (err) => {
//                 if (err) return next(err);
//                 console.log(req.user)
//                 res.status(200).json({ message: "Login successful", user });
//             });
//         })(req, res, next);
//     }
// );

authRoute.post("/register",[
    body('username')
    .trim().
    isEmail()
    .withMessage('email should be valid email addresss').
    normalizeEmail()
    .toLowerCase(),
    body('password')
    .trim()
    .isLength({min:8})
    .withMessage("Minimum 8 length is required for password ")   
],
    async(req,res,next)=>{
    try{

    console.log(req.body)
    const errors=validationResult(req)
    if(!errors.isEmpty())
    {
       // console.log(errors)
        errors.array().forEach(er=>{
            res.status(400).json({message:er.msg,status:400})
        })
        return
    }
    const {username,password,name}= req.body;
    if(password.length<6)
    {
         res.status(400).json({"message":"password length must be greater than 6","status":400})
         return 
    }
    let userExist=await user.findOne({email:username})
    console.log(userExist)
    if(!userExist)
    {    
    const createdUser= await user.create({email:username,password:password,name:name})
    if(createdUser)
    {  

   return res.status(201).json({"message":"registered successfully","status":201,"data":createdUser})
    }
    }
    else{
        return res.status(400).json({"message":"userName already exist choose another email/username","status":400})
    }
}
catch(error)
{
    // return res.status(400).json({"message":"Internal server error","status":400})
    next(error)
}

})


authRoute.get("/logout", async (req, res, next) => {
    try {
        // Cookie options that match the ones used during login
        const cookieOptions = {
            httpOnly: true,  // Ensure this matches the cookie settings
            secure:true,  // Use secure cookies in production
            path: '/',  // Same path as the one used when setting the cookie
            sameSite: 'strict',  // Ensure sameSite is set the same way
         //   expires: new Date(0),  // Set expiration to a date in the past
        };
       //console.log(req.cookies.authToken)
        // Clear the authToken cookie
        res.clearCookie("authToken", cookieOptions);

        // Send a response confirming the logout
        return res.status(200).clearCookie('authToken',cookieOptions).json({ message: "User logged out successfully", status: 200 });
    } catch (error) {
        console.log("Logout error:", error);
        next(error);
    }
});

export default authRoute;