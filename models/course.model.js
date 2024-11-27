import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        
    },
    image: {
        type: String, // URL of the image
       
    },
    mentor: {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required:true    

            },
    mentorname:{
        type:String,
        required:true,
    },
    fees: {
        type: Number,
         required:true
      
    },
    duration: {
        type: String ,// Array of labels (tags or categories)
       required:true,
    },
   
   
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields





const CourseModel = mongoose.model('Course', courseSchema);

export default CourseModel;