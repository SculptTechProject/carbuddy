import { Router } from "express";
import { loginAdmin } from "../../controllers/admin/auth.admin.controller";

const router = Router();

router.post("/admin/login", loginAdmin);

export default router;
