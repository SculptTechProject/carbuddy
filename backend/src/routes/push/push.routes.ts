import { Router } from "express";
import { authenticate } from "../../middleware/user.authenticate";
import { saveSubscription } from "../../controllers/push/push.controller";

const router = Router();

router.post("/subscribe", authenticate, saveSubscription);

export default router;
