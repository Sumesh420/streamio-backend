import { Router } from "express";
import {
  addComment,
  deleteComment,
  getAllVideoComments,
  updateComment,
} from "../controllers/comment.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(verifyJWT);
router.route("/:videoId").get(getAllVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
export default router;
