import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import dotenv from "dotenv"
dotenv.config()
async function getUser(token)
{   try{
    
    if(!token)
{
    return null
}
    let data=jwt.verify(token,process.env.AUTH_TOKEN_SECRET)
    let userData=await User.findById(data._id).select('-password')
    if(userData)
    {
        return userData
    }
    else{
        return null
    }
}
catch(e)
{
    return null
}
}

async function getUserDataFromCookie(req,res,next)
{
    if(req.cookies)
    {
        if(req.cookies.authToken)
        {    //console.log("data from cookie",req.cookies.authToken)
            let userData=await getUser(req.cookies.authToken)
            //console.log(userData ,"from cookie")
            if(userData.status=='INACTIVE')
            {
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
                return res.status(403).json({message:"Your account is blocked",status:400})
            }
            req.user=userData;
            next()
        }
        else{
            return next();
        }

    }

}
const checkIsMentor=async(req,res,next)=>
    {
        try{
            if(req.user.role=='MENTOR')
                {  console.log("reached")
                    next()
                }
                else{
                    return res.status(402).json({message:"you are not authorized to access this route",status:400})
                }
        }
        catch(error)
        {
            next(error)
        }
    
    }
export {getUserDataFromCookie,checkIsMentor}