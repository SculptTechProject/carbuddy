import { Router } from "express";
import { authenticate } from "../../middleware/user.authenticate";
import { getUserData } from "../../controllers/user/user.controller";

const router = Router();

router.get("/user/me", authenticate, getUserData);

export default router;
