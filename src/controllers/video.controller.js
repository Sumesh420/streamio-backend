import mongoose,{isValidObjectId,ObjectId} from "mongoose";
import {Video} from "../models/video.model.js";
import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/clodinary.js";
import fs from "fs";

const getAllVideos=asyncHandler(async(req,res)=>{
    const{page=1,limit=10,query,sortBy="createdAt",sortType="asc",userId}=req.query;
    const matchStage={
        isPublished:true,
    }
    if(isNaN(page) || isNaN(limit) ||page<1 || limit<1){
        throw new ApiError(400,"Invalid pagination parameters")
    }
     // Apply search by title or description
     // filter: get videos only by a specific user
     if(query){
        matchStage.$or=[
            {title:{$regex:query,$options:"i"}},
            {description:{$regex:query,$options:"i"}}
        ]
     };
     if(userId&&isValidObjectId(userId)){
        matchStage.owner=new mongoose.Types.ObjectId(userId);
     }
     const pipeline=[
        {
            $match:matchStage
        },
        {
            $sort:{
                [sortBy]:sortType==="asc"?1:-1
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                title:1,
                description:1,
                thumbnail:1,
                views:1,
                duration:1,
                videoFile:1,
                createdAt:1,
                owner:{
                    _id:1,
                    fullname:1,
                    username:1,
                    avatar:1
                }
            }
        }
     ];
     const options={
        page:parseInt(page),
        limit:parseInt(limit),
        customLabels:{
            doc:"videos",
            totalDocs:"totalVideos",
            page:"currentPage",
            totalPages:"totalPages"
        }
     };
     const videos=await Video.aggregatePaginate(Video.aggregate(pipeline),options);
     res.status(200).json(new ApiResponse(200,videos,"videos fetched successfully"))
});
const publishVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body;
    if(!(title && description)){
        throw new ApiError(400,"title and description are required")
    }
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    const videoFileLocalPath=req.files?.videoFile[0]?.path;
    if(!(thumbnailLocalPath && videoFileLocalPath)){
        throw new ApiError(400,"thumbnail and video file is required")
    }
   const thumbnail= await uploadOnCloudinary(thumbnailLocalPath);
   const videoFile= await uploadOnCloudinary(videoFileLocalPath);
   fs.unlinkSync(thumbnailLocalPath);
   fs.unlinkSync(videoFileLocalPath);
   if(!(thumbnail&&videoFile)){
    throw new ApiError(400,"Something went wrong while uploading on cloudinary");
   }
   const video=await Video.create({
    title,
    description,
    thumbnail:thumbnail.url,
    videoFile:videoFile.url,
    thumbnailPublicId:thumbnail.public_id,
    videoFilePublicId:videoFile.public_id,
    duration:videoFile.duration,
    owner:req.user?._id
   });
   if(!video){
    throw new ApiError(400,"SOmething went wrong while craeting the video")
   }
   res.status(200).json(new ApiResponse(200,video,"Video published successfully"));
});
const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid id format")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    res.status(200).json(new ApiResponse(200,video,"Video fetched successfully"));
});
const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {title,description}=req.body;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Id format")
    }
    const video=await Video.findById(videoId);
    if(title){
        video.title=title;
    }
    if(description){
        video.description=description;
    }
    const newthumbnailLocalPath=req.files?.thumbnail[0]?.path;
    if(newthumbnailLocalPath){
      const newthumbnailPath=await uploadOnCloudinary(newthumbnailLocalPath);
      //remove from local
      fs.unlinkSync(newthumbnailLocalPath);
       if(!newthumbnailPath?.url){
        throw new ApiError(500, "Cloudinary upload failed")
    }
    video.thumbnail=newthumbnailPath.url;
    }
    
   
    const updatedVideo=await video.save({validateBeforeSave:false});
    if(!updatedVideo){
        throw new ApiError(400,"Something went wrong while updating the value");
    }
    res.status(200).json(new ApiResponse(200,updatedVideo,"Video information updated successfully"));

});
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Id format");
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    if (video.thumbnailPublicId) {
        try {
            await deleteFromCloudinary(video.thumbnailPublicId);
        } catch (error) {
            throw new ApiError(500, "Failed to delete video file from Cloudinary");
        }
    }
    if (video.videoFilePublicId) {
        try {
            await deleteFromCloudinary(video.videoFilePublicId);
        } catch (error) {
            
            throw new ApiError(500, "Failed to delete video file from Cloudinary");
        }
    }
   const deletedVideo= await Video.findByIdAndDelete(videoId);
   if(!deletedVideo){
    throw new ApiError(404,"Video not found");
   }
   
   res.status(200).json(new ApiResponse(200,{},"Video deleted successfully"));
});
const togglePublishStatus=asyncHandler(async(req,res)=>{
       const { videoId } = req.params;
       if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Id format");
       };
      const video=await Video.findById(videoId);
      if(!video){
        throw new ApiError(404,"video not found");
      };
      video.isPublished=!video.isPublished;
      const updatedPublishedStatusVideo=await video.save();
       res.status(200).json(new ApiResponse(200,updatedPublishedStatusVideo,"Published status updated successfully"))
});
export {getAllVideos,publishVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus}