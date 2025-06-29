import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  addVideoToPlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";
const router = Router();
router.use(verifyJWT);
router.route("/").post(createPlaylist);
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").post(removeVideoFromPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
export default router;