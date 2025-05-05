import {asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/clodinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser=asyncHandler(async(req,res)=>{
    //get user data from fontend
    //validate-non empty
    //check if user already exists:username,email
    //check for images ,check for avatar
    //upload them to cloudinary,avatar
    //create for user object ,create entry in db
    //remove password and refresh token from response
    //check for user creation
    //return res
    const {username,email,password,fullName}=req.body
    console.log("email:",email)
    if(
        [fullName,email,password,username].some((field)=>field.trim()==="")
    ){
        throw new ApiError(402,"All fields are required")
    }
   const existedUser= User.findOne({
        $or:[{username},{email}]
    })
     if(existedUser){
        throw ApiError(409,"User with username or email exists")
     }
     const avatarLocalPath=req.files?.avatar[0]?.path
     const coverImagePath=req.files?.coverImage[0]?.path
     if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
     }
     const avatar=await uploadOnCloudinary(avatarLocalPath);
     const coverImage=await uploadOnCloudinary(coverImagePath);
     if(!avatar){
        throw new ApiError(400,"Avatar file is required")
     }
     const user=await User.create({
        fullName,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url,
        password,
        username:username.toLowerCase()
     });
     const createdUser=await User.findById(user._id).select("-password -refreshToken");
     if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
     }
     return res.status(201).json(
                new ApiResponse(200,createdUser,"User registered Successfully")
     )
})
export {registerUser}