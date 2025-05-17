import mongoose,{Schema,model} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    watchHistory:{
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },
    coverImage:{
        type:String
    },
    refreshToken:{
        type:String
    }
},{timestamps:true});
userSchema.pre("save",async function(next){
    try {
        if(!this.isModified("password")) return next();
        this.password=await bcrypt.hash(this.password,10)
        next()
    } catch (error) {
        next(error)
    }
});
userSchema.methods.isPasswordMatch=async function(password){
    try{
        return await bcrypt.compare(password,this.password);
    }
    catch(error){
        throw new Error("Error comparing password",error)
    }
}
userSchema.methods.generateAccessToken=async function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
}
userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

export const User=model("User",userSchema)