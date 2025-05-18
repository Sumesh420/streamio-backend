import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new ApiError(400, "Content is required");
  }

  if (trimmedContent.length > 1000) {
    throw new ApiError(400, "tweet cannot exceed 1000 characters");
  }
  const createdTweet = await Tweet.create({
    owner: req.user._id,
    content: trimmedContent,
  });
  if (!createdTweet) {
    throw new ApiError(500, "Failed to create tweet");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweet created successfully"));
});
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const allUserTweets = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "_id",
        foreignField: "owner",
        as: "tweets",
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $project: {
              content: 1,
              createdAt: 1,
              _id: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        allUserTweets: "$tweets",
        allUserTweetCount: {
          $size: "$tweets",
        },
      },
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        avatar: 1,
        allUserTweets: 1,
        allUserTweetCount: 1,
      },
    },
  ]);

  const userWithTweet = allUserTweets[0];
  if (!userWithTweet) {
    throw new ApiError(404, "User or tweets not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userWithTweet, "tweets fetched successfully"));
});
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Id format");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required to update tweet");
  }
  if (content.trim().length > 1000) {
    throw new ApiError(400, "Content length exceeds 1000");
  }
  const tweet = await Tweet.findById(tweetId);
  const tweetOwnerId = tweet.owner;
  if (!tweetOwnerId.equals(userId)) {
    throw new ApiError(401, "Not authorized to update the tweet");
  }
  tweet.content = content;
  const updatedTweet = await tweet.save();
  if (!updatedTweet) {
    throw new ApiError(500, "Failed to update the comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Id format");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }
  if (!tweet.owner.equals(userId)) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }
  const deletedtweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedtweet) {
    throw new ApiError(500, "Failed to delete the comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"));
});
export { createTweet, getUserTweets, updateTweet, deleteTweet };
