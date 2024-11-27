import express from "express"
import { getUserDataFromCookie} from "../middleware/authData.middleware.js"
import User from "../models/user.model.js"
import CourseModel from "../models/course.model.js"
const userRoute=express.Router()

userRoute.get("/profile", getUserDataFromCookie,async(req,res)=>{
    if(req.user)
    { 
 return res.status(200).json({user:req.user,message:"data retrieved successfully",status:200})
    }
    else{
        return res.status(401).json({message:"Login first",status:400})
    }
})



userRoute.get("/profile/:id", getUserDataFromCookie,async(req,res)=>{
    if(req.user)
    { 
        const userId=req.params.id
    let requestedUser=await User.findById(userId).select("-password")


 return res.status(200).json({user:requestedUser,message:"data retrieved successfully",status:200})
    }
    else{
        return res.status(401).json({message:"Login first",status:400})
    }
})

userRoute.patch("/subscribe/:courseId",getUserDataFromCookie,async(req,res,next)=>{
    try{

       if(req.user)
        { 
    if(req.user.role!="STUDENT")
    {
      return res.status(403).json({message:"You can not subscriobe course please login as student",status:400})
    }
    console.log("reached here")
    let userRecord=req.user;
    let courseId=req.params.courseId
    let updatedCourses=[...userRecord.courses]
   let f=false
    for(let course of updatedCourses)
    {
        if(course._id==courseId)
        {
            f=true
            break
        }
    }
    if(f==false)
    {
        let courseDetail=await CourseModel.findById(courseId)
        updatedCourses.push(courseId)
        let updatedUser=   await User.findByIdAndUpdate(userRecord._id,{courses:updatedCourses},{new:true})
     return res.status(200).json({message:` ${courseDetail.title} has been subscribed to ${userRecord.name} `,user:updatedUser,status:200})

    }
    else{
        return res.status(400).json({message:"This course is already subscribed by you, check subscription  section",status:400})
    }
  

}
else{
    return res.status(400).json({message:"unauthorized user",status:400})
}
}
catch(error)
{
    next(error)
}
})
userRoute.get("/getSubscriptions",getUserDataFromCookie,async(req,res,next)=>{
 
    try{

        if(req.user)
         { 
     if(req.user.role!="STUDENT")
     {
       return res.status(403).json({message:"You can not subscriobe course please login as student",status:400})
     }
     console.log("reached here")
     let userRecord=req.user;
    
         let userDetail=await User.findById(userRecord._id)
         let coursesIds=userDetail.courses
         if(userDetail)
         {
            let courses=[]
            for(let courseId of coursesIds)
            {
                let courseData=await CourseModel.findById(courseId)
                courses.push(courseData)
            }
            return res.status(200).json({message:` subscribed courses for ${userRecord.name} retrieved successfully `,courses:courses,status:200})       
         }
         else{
            return res.status(400).json({message:"unauthorized user",status:400})
         }
         
 }
 else{
     return res.status(400).json({message:"unauthorized user",status:400})
 }
 }
 catch(error)
 {
     next(error)
 }



})

userRoute.patch("/remove-subscription/:courseId",getUserDataFromCookie,async(req,res,next)=>{
    try{
if(req.user)
{
    let courseId=req.params.courseId
let userRecord=await User.findById(req.user._id)
let courseIds=userRecord.courses
let updatedsubscriptionList=[]
for(let id of courseIds)
{
    if(id!=courseId)
    {
        updatedsubscriptionList.push(id)
    }
}
let updatedUserRecord=await User.findByIdAndUpdate(userRecord._id,{courses:updatedsubscriptionList},{new:true})
let updatedCourses=[]
            for(let courseId of updatedUserRecord.courses)
            {
                let courseData=await CourseModel.findById(courseId)
                updatedCourses.push(courseData)
            }
res.status(201).json({message:` course Unsubscribed successfully `,courses:updatedCourses,status:200})  

}
else{
    return res.status(400).json({message:"unauthorized user",status:400})
}
    }
    catch(e)
    {
        next(e)
    }
})




userRoute.get("/getSubscriptions-admin-profile/:userId",async(req,res,next)=>{
 
    try{
      let userId=req.params.userId;

     let user=await User.findById(userId)
     console.log(user,"from admin request")
     if(user)
        {
            let coursesIds=user.courses
          
               let courses=[]
               for(let courseId of coursesIds)
               {
                   let courseData=await CourseModel.findById(courseId)
                   courses.push(courseData)
               }
               console.log(courses)
               return res.status(200).json({message:` subscribed courses for ${userRecord.name} retrieved successfully `,courses:courses,status:200})       

        }       
     
    
         
         else{
            return res.status(400).json({message:"unauthorized user",status:400})
         }
         
 
 
 }
 catch(error)
 {
     next(error)
 }



})


export default userRoute;