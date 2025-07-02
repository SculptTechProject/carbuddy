import { Router } from "express";
import { authenticate } from "../../middleware/user.authenticate";
import {
  saveSubscription,
  unsubscribePush,
} from "../../controllers/push/push.controller";

const router = Router();

router.post("/subscribe", authenticate, saveSubscription);
router.post("/unsubscribe", authenticate, unsubscribePush);

export default router;
