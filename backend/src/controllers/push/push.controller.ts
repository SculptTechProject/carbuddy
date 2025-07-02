import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/user.authenticate";
import { NextFunction, Request, Response } from "express";

/**
 *  POST /api/v1/push/subscribe
 *  Body   { endpoint, keys:{ p256dh, auth } }
 */
export async function saveSubscription(req: Request, res: Response) {
  const { endpoint, keys } = req.body || {};

  // ── walidacja ─────────────────────────────────────────────
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ message: "Malformed subscription" });
    return;
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: (req as any).user.id, // masz z middleware authenticate
      },
    });
    res.sendStatus(201);
    return;
  } catch (err) {
    console.error("[push] saveSubscription error", err);
    res.status(500).json({ message: "DB error" });
    return;
  }
}

export const unsubscribePush = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { endpoint } = req.body;
  try {
    if (!endpoint) {
      res.status(400).send();
      return;
    }
    await prisma.pushSubscription.deleteMany({
      where: { userId: req.user!.id, endpoint },
    });
    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
  }
};
