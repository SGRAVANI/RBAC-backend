import mongoose from "mongoose";
import bcrypt from "bcrypt"


const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowercase:true,
        
        
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["ADMIN","MENTOR","STUDENT"],
        default:"STUDENT"
    },
    status:{
        type:String,
        enum:["ACTIVE","INACTIVE"],
        default:'ACTIVE'
    },
    courses:{
    type: [{type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
     }  
     ],
     default:[]

    }
},{
    timestamps:true
})
userSchema.pre("save",async function(next){
if(!this.isModified("password"))
{
    return next()
}
this.password=await bcrypt.hash(this.password,10)
//console.log(this.password)
if(this.email==process.env.ADMIN_EMAIL)
{
    this.role='ADMIN'
}
next()
})
userSchema.methods.verifyPassword=async function (password) {
    try{
   return   await bcrypt.compare(password,this.password)
    }
    catch(error)
    {
    throw new Error({status:500,mssage:"Internal Server Error"})
    }
}
let User=mongoose.model("User",userSchema)
export default User;