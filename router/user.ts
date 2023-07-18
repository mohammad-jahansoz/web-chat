import { Router } from "express";
import { home, getSearch, postSearch, sendMessage } from "../controller/user";
import upload from "../middleware/multer";
const router = Router();

router.get("/", home);
router.get("/search", getSearch);
router.post("/search", postSearch);
router.post("/:username", sendMessage);
// router.post("/upload", upload.single("image"));

export default router;
