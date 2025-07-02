import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/user.authenticate";
import { Response } from "express";

export const saveSubscription = async (req: AuthRequest, res: Response) => {
  const { endpoint, keys } = req.body; // PushSubscriptionJSON
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: req.user!.id,
      endpoint,
      auth: keys.auth,
      p256dh: keys.p256dh,
    },
    update: { auth: keys.auth, p256dh: keys.p256dh },
  });
  res.sendStatus(201);
};
