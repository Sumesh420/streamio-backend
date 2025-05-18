import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { title } from "process";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Id format");
  }
  const existingVideoLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });
  if (existingVideoLike) {
    await existingVideoLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, {}, "Video unliked"));
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    if (!newLike) {
      throw new ApiError(500, "Failed to like video");
    }
    return res
      .status(200)
      .json(new ApiResponse(201, newLike, "Video Liked Successfully"));
  }
});
const toggleCommentlike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Id format");
  }
  const existingLikedComment = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (existingLikedComment) {
    await existingLikedComment.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  } else {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    if (!newLike) {
      throw new ApiError(500, "Failed to like comment");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Comment liked successfully"));
  }
});
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Id format");
  }
  const exisitingTweetLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });
  if (exisitingTweetLike) {
    await exisitingTweetLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  } else {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!newLike) {
      throw new ApiError(500, "Failed to like tweet");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, newLike, "Tweet liked successfully"));
  }
});
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnail: 1,
              owner: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $replaceRoot: {
        $newRoot: "$video",
      },
    },
  ]);
  if (!likedVideos) {
    throw new ApiError(500, "Failed to fetch videos");
  }
  const totalLikedVideos = likedVideos.length;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos: likedVideos, totalLikedVideos },
        "Videos fetched successfully"
      )
    );
});
export { toggleVideoLike, toggleCommentlike, toggleTweetLike, getLikedVideos };
