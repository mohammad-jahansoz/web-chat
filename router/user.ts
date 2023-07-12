import { Router } from "express";
import { home, getSearch, postSearch, sendMessage } from "../controller/user";
const router = Router();

router.get("/", home);
router.get("/search", getSearch);
router.post("/search", postSearch);
router.post("/:username", sendMessage);

export default router;
