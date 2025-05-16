import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const statsResult = await Video.aggregate([
    {
      $match: new mongoose.Types.ObjectId(req.user?._id),
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "channelSubscribers",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "channelLikes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$channelLikes",
        },
        subscribersCount: {
          $size: "$channelSubscribers",
        },
      },
    },
    {
      $project: {
        title,
        likesCount: 1,
        views: 1,
        subscribersCount: 1,
      },
    },
  ]);
  if (!statsResult) {
    throw new ApiError(404, "stats not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, statsResult, "Channel fetched successfully"));
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
