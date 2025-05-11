// routes/adminRoutes.ts
import { Router } from "express";
import {
  getUsers,
  banUser,
} from "../../controllers/admin/admin.controller";
import { protectAdmin } from "../../middleware/protectAdmin";

const router = Router();

router.get("/users", protectAdmin, getUsers);
router.patch("/ban/:id", protectAdmin, banUser);

export default router;
