import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;
  if (!(name && description)) {
    throw new ApiError(400, "Name and description is required");
  }
  if (description.length > 750) {
    throw new ApiError(400, "Description must be 750 characters or less");
  }
  const createdPlaylist = await Playlist.create({
    owner: userId,
    name,
    description,
  });
  if (!createdPlaylist) {
    throw new ApiError(500, "Failed to create playlist");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdPlaylist, "Playlist created successfully")
    );
});
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(401, "UserId is required");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "invalid User");
  }
  const userPlaylist = await Playlist.find({
    owner: userId,
  })
    .populate({
      path: "videos",
      select: "_id title thumbnail",
    })
    .exec();
  if (!userPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "userPlaylist fetched successfully")
    );
});
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(401, "playlistId is required for playlist");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const playlistById = await Playlist.findById(playlistId)
    .populate({
      path: "owner",
      select: "username fullname avatar",
    })
    .populate({
      path: "videos",
      select: "_id title description thumbnail createdAt",
    })
    .exec();
  if (!playlistById) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlistById, "Playlist fetched successfully"));
});
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlistId and videoId both are required");
  }
  if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
    throw new ApiError(401, "Invalid playlistId or videoId");
  }
  const updatedplaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "owner",
      select: "username fullname avatar",
    })
    .populate({
      path: "videos",
      select: "_id title description thumbnail",
    })
    .exec();
  if (!updatedplaylist) {
    throw new ApiError(500, "Failed to add video to playlist");
  }
  return res.status(200).json(new ApiResponse(200, updatedplaylist));
});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlistId and videoId is required");
  }
  if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
    throw new ApiError(401, "Invalid playlistId or videoId format");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "owner",
      select: "username fullname avatar",
    })
    .populate({
      path: "videos",
      select: "_id title description thumbnail",
    })
    .exec();
  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to remove video from playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed successgully"));
});
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid playlistId format");
  }
  const videoDeleted = await Playlist.findByIdAndDelete(playlistId);
  if (!videoDeleted) {
    throw new ApiError(404, "Playlist not found or already deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "playlist deleted successfully"));
});
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId) {
    throw new ApiError(400, "Invalid playlistId");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "Invalid playlistId format");
  }
  if (!(name && description)) {
    throw new ApiError(400, "name and description both are required");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Playlist info updated successfully"
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
