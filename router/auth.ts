import { Router } from "express";
import { getLogin, postLogin } from "../controller/auth";
const router = Router();

router.get("/auth/login", getLogin);
router.post("/auth/login", postLogin);

export default router;
