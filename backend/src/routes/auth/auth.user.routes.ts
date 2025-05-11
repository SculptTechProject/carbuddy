import {
  userLogin,
  userLogout,
  userRegister,
} from "../../controllers/auth/auth.user.controller";
import { Router } from "express";
import { authenticate } from "../../middleware/user.authenticate";

const router = Router();

router.post("/user/register", userRegister);

router.post("/user/login", userLogin);

router.post("/user/logout", authenticate, userLogout);

export default router;
