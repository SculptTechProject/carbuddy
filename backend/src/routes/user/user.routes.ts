import { Router } from "express";
import { authenticate } from "../../middleware/user.authenticate";

const router = Router();

router.get("/user/me", authenticate,);