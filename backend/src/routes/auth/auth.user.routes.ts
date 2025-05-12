import {
  userLogin,
  userLogout,
  userRegister,
} from "../../controllers/auth/auth.user.controller";
import { Router } from "express";
import { authenticate } from "../../middleware/user.authenticate";

const router = Router();

router.post("/auth/register", userRegister);

router.post("/auth/login", userLogin);

router.post("/auth/logout", authenticate, userLogout);

export default router;
