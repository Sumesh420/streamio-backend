import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentlike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
import { Router } from "express";
const router = Router();
router.use(verifyJWT);
router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentlike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
export default router;
