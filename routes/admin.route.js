import express from "express"
import {getUserDataFromCookie} from "../middleware/authData.middleware.js"
let adminRouter=express.Router()
import User from "../models/user.model.js"

const checkIsAdmin=async(req,res,next)=>
{
    try{
        if(req.user.role=='ADMIN')
            {
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
adminRouter.get('/users',getUserDataFromCookie,checkIsAdmin,async(req,res,next)=>{
try{  
     const users=await User.find();
     return res.status(200).json({message:"users retrieved successfully",users:users,status:200})
      next()
}
catch(error)
{
    next(error)
}
})

adminRouter.patch('/updateRole/:userId',getUserDataFromCookie,checkIsAdmin,async(req,res,next)=>{
    try{  
        let id=req.params.userId
        let {role}=req.body;
        console.log(id,"by path")
            console.log(req.user._id,"by token")
 
         const user=await User.findById(id);
         if(user.role==role)
         {
            return res.status(400).json({message:`Selected role is ${role} already, select any other role to update `,status:400})
         }
         if(user)
         {
                       if(String(req.user._id)==String(id))
                {   console.log("id matched")
                    return res.status(400).json({message:"Admin can not remove themselves from Admin,ask another admin!!!",status:400})
                }
          let updatedUser=await User.findByIdAndUpdate(id,{role:role},{new:true})
          return res.status(200).json({message:`Role of ${user.email} has been changed from ${user.role} to ${updatedUser.role}`,user:updatedUser,status:200})
          next()
         }
         else{
            return res.status(400).json({message:"user not available",status:400})
         }
         
    }
    catch(error)
    {
        next(error)
    }
    })


    adminRouter.patch('/updateStatus/:userId',getUserDataFromCookie,checkIsAdmin,async(req,res,next)=>{
        try{  
            let id=req.params.userId
            let {status}=req.body;
            console.log(id,"by path")
                console.log(req.user._id,"by token")
     
             const user=await User.findById(id);
            
             if(user)
             {
                           if(String(req.user._id)==String(id))
                    {   console.log("id matched")
                        return res.status(400).json({message:"Admin can not change own status,ask another admin!!!",status:400})
                    }
              let updatedUser=await User.findByIdAndUpdate(id,{status:status},{new:true})
              return res.status(200).json({message:`Status of ${user.email} has been changed from ${user.status} to ${updatedUser.status}`,user:updatedUser,status:200})
              next()
             }
             else{
                return res.status(400).json({message:"user not available",status:400})
             }
             
        }
        catch(error)
        {
            next(error)
        }
        })
    



    adminRouter.delete('/deleteUser/:userId', getUserDataFromCookie, checkIsAdmin, async (req, res, next) => {
        try {
            const id = req.params.userId;
    
            // Check if user exists
            const user = await User.findById(id);
            if (!user) {
                return res.status(400).json({ message: "User not available", status: 400 });
            }
            console.log(id,"by path")
            console.log(req.user._id,"by token")
            if(String(req.user._id)==String(id))
                {   console.log("id matched")
                    return res.status(400).json({message:"Admin can not remove themselves from Admin,ask another admin !!!",status:400})
                }
            // Proceed to delete the user
            const deletedUser = await User.findByIdAndDelete(id);
            if (deletedUser) {
                return res.status(200).json({ message: `User ${deletedUser.email} is Deleted`, status: 200, user: deletedUser });
            } else {
                return res.status(400).json({ message: "User cannot be deleted", status: 400 });
            }
    
        } catch (error) {
            next(error); // Pass error to the error handler middleware
        }
    });
    
export default adminRouter;