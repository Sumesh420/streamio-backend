import { Router } from "express";
import { addComment, deleteComment, getAllVideoComments, updateComment } from "../controllers/comment.controller";

const router=Router();
router.route("/:videoId").get(getAllVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
export default router;