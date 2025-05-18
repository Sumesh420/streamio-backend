import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "Unauthorized");

  // Get total subscribers for the channel (user)
  const subscribersCount = await Subscription.countDocuments({ channel: userId });

  // Aggregate video stats grouped by owner (channel)
  const statsResult = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "videoLikes"
      }
    },
    {
      $group: {
        _id: "$owner",
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$videoLikes" } }
      }
    },
    {
      $addFields: {
        subscribersCount: subscribersCount
      }
    },
    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
        subscribersCount: 1
      }
    }
  ]);

  if (!statsResult || statsResult.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No stats available for this channel"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, statsResult[0], "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const channelAllVideos = await Video.find({
    owner: userId,
  })
    .select("_id title thumbnail views createdAt")
    .sort({ createdAt: -1 });
  if (!channelAllVideos) {
    throw new ApiError(404, "Videos not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channelAllVideos, "videos fetched successfully")
    );
});
export { getChannelStats, getChannelVideos };
