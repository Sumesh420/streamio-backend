import { Router } from "express";
import {loginUser, logoutUser, registerUser,refreshAccessToken, changeCurrentPasword, getCurrentUser, updateAcountDetails, updateUserAvatar, updateUserCoverImage, getUserchannelProfile, getUserWatchHistory} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()

router.route("/register").post(
   upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
   ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPasword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAcountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/update-coverimage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT,getUserchannelProfile);
router.route("/watch-history").get(verifyJWT,getUserWatchHistory);
export default router