import mongoose ,{isValidObjectId} from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const getAllVideoComments=asyncHandler(async(req,res)=>{
    const {videoId} =req.params;
     const {page = 1, limit = 10} = req.query;
     if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Id format");
     };
      const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
     if(isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage<1 || parsedLimit<1){
        throw new ApiError(400,"Invalid pagination format");
     };
     const commentAggregate= await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                     $project: { 
                         _id:1,
                        title:1,
                        thumbnail:1,
                     }
                    }
                ]
            }
        },
        {
            $unwind:"$video"
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                createdAt:1,
                content:1,
               owner:"$owner",
               video:"$video"
            }
        }
     ]);
     if(!commentAggregate?.length){
        throw new ApiError(404, `No comments found for video ${videoId}`); 
     };
     const options={
        page:parseInt(parsedPage),
        limit:parseInt(parsedLimit),
        customLabels:{
            docs:"comments",
            totalDocs:"totalComments",
            page:"currentPage",
            totalPages:"totalPages",
            meta:"paginator"
        }
     };
     const allComments=await Comment.aggregatePaginate(commentAggregate,options);
    return res.status(200).json(new ApiResponse(200,allComments,"Comments fetched successfully"));

});
const addComment = asyncHandler(async (req, res) => {
    const {videoId}=req.params;
    const {content}=req.body;
    if(!isValidObjectId(videoId) ){
        throw new ApiError(400,"Invalid Id format ");
    };
     const video = await Video.findOne({
        _id: videoId,
        isPublished: true 
    });
    if(!video){
         throw new ApiError(404, "Video not found");
    }
    if(!content || content.trim()===""){
   throw new ApiError(400, "Comment content is required");
    }
    if (content.trim().length > 1000) {
    throw new ApiError(400, "Comment cannot exceed 1000 characters");
}
    const createdComment=await Comment.create({
        owner:req.user?._id,
        video:videoId,
        content:content.trim()
    })
   if (!createdComment){
        throw new ApiError(500, "Failed to create comment");
    };
    return res.status(200,createdComment,"comment created successfully");
});
const updateComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    const {content}=req.body;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Id format");
    };
    if(!content || content.trim()===""){
        throw new ApiError(400,"Comment content is required")
    }
    if(content.trim().length>1000){
        throw new ApiError(400, "Comment cannot exceed 1000 characters");
    }
    const updatedComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
            content:content.trim(),
            updatedAt:Date.now()
        }
        },
        {
            new:true
        }
    );
    if(!updatedComment){
        throw new ApiError(500,"Failed updating comment")
    }
    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully"))
});
const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Id format");
    };
    const comment=await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"Comment not found");
    };
    if(!comment.owner.equals(req.user?._id)){
         throw new ApiError(403, "You are not authorized to delete this comment");
    }
    const deletedComment=await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
         throw new ApiError(500, "Failed in deleting the comment");
    }
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted Successfully"));
});
export {getAllVideoComments,addComment,updateComment,deleteComment}