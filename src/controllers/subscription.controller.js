import { Subscription } from "../models/subscription.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate({
    path: "channel",
    select: "username fullname avatar"
  });

  return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  // Cannot subscribe to your own channel
  if (channelId.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  let message = "";

  if (existingSubscription) {
    // If subscription exists, remove it
    await Subscription.findByIdAndDelete(existingSubscription._id);
    message = "Unsubscribed successfully";
  } else {
    // Else, create a new one
    await Subscription.create({
        subscriber: userId,
        channel: channelId,
    });
    message = "Subscribed successfully";
  }

  return res.status(200).json(new ApiResponse(200, null, message));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscriptions = await Subscription.find({ channel: channelId }).populate({
    path: "subscriber",
    select: "username fullname avatar"
  });

  return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribers fetched successfully"));
});



export {getUserChannelSubscribers,getSubscribedChannels,toggleSubscription }