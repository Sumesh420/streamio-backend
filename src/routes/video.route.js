import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  updateVideo
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "thumbnail",
        maxCount: 1,
      },
      {
        name: "videoFile",
        maxCount: 1,
      },
    ]),
    publishVideo
  );
router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(updateVideo);
export default router;
