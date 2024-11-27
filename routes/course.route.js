import express from "express"


import User from "../models/user.model.js"
import CourseModel from "../models/course.model.js"
import {getUserDataFromCookie,checkIsMentor} from "../middleware/authData.middleware.js" 
import {v2 as cloudinary} from "cloudinary"
let courseRouter=express.Router()
cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret: process.env.CLOUDNARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});
const createCourse = async (req, res) => {
    try {
        
        console.log("create Course called")
        const { title, image, mentorId, fees, duration } = req.body;
                  
        console.log(req.body)
       
       
        if (!title || !mentorId || !fees) {
            return res.status(400).json({ message: "Title, mentor, and fees are required" });
        }
        const user = await User.findById(mentorId).select("-password");
        console.log(user)
         if (!user) {
             return res.status(404).json({ message: "User not found" });
         }
 
   const file=req.files.image;
   let imageURl;

   cloudinary.uploader.upload(file.tempFilePath,(error,result,next)=>{
    console.log(result)
    imageURl=result.url;
    const newCourse=new CourseModel({
        
            title,
            
          
            image:imageURl,
            mentor:mentorId,
            mentorname:req.user.name ,  
            fees:fees,
            duration: duration,
             
        
    })
    newCourse.save()
    .then((result)=>{
        return res.status(201).json({ message: "Course Created successfully", data: newCourse ,status:200});
    })
    .catch((e)=>{
        console.log(e.message)
        next(e)
    })
   })
        
    } catch (e) {
        console.error("Error creating course:", e); // Log error for debugging
       return res.status(500).json({ message: "An error occurred while creating the blog",status:400 });
    }
};

courseRouter.post("/addCourse",async (req,res,next)=>{
    console.log(req.body, "from create course route")
    next()
},getUserDataFromCookie, checkIsMentor,createCourse);


courseRouter.get("/getData",getUserDataFromCookie, checkIsMentor,async (req,res,next)=>{
try{
  //  console.log("reached at getdata path")
    let mentorId=req.user._id
     //let fetchedUser=await User.findById(mentorId)
     let courses=await CourseModel.find({mentor:mentorId})
console.log(mentorId,courses)
if(courses)
{
    return res.status(200).json({message:"courses retrieved successfully",data:courses,status:200})
}
else{
    return res.status(200).json({message:"Error occured while fetching courses",status:400,data:[]})
}
}
catch(e)
{
    next(e)
}
})


courseRouter.delete("/deleteCourse/:courseId",getUserDataFromCookie,checkIsMentor,async(req,res,next)=>{
    try {
        const id = req.params.courseId;

        // Check if user exists
        const course = await CourseModel.findById(id);
        if (!course) {
            return res.status(400).json({ message: "Course not available", status: 400 });
        }
        //console.log(id,"by path")
       // console.log(req.user._id,"by token")
        
        const deletedCourse = await CourseModel.findByIdAndDelete(id);
        if (deletedCourse) {
            return res.status(200).json({ message: `Course ${deletedCourse.title} is Deleted`, status: 200, course: deletedCourse });
        } else {
            return res.status(400).json({ message: "User cannot be deleted", status: 400 });
        }

    } catch (error) {
        next(error); // Pass error to the error handler middleware
    }    
})
courseRouter.get("/allCourses", async(req,res,next)=>{
    try{
     let courses=await CourseModel.find()
     if(courses)
     {
        return res.status(200).json({message:"Courses Retrieved Successfuly",courses:courses,status:200})
     }
     else{
        return res.status(400).json({message:"Error occured in fetching courses",status:400,courses:[]});
     }
    }
    catch(error)
    {
        next(error)
    }
})



export default courseRouter;
