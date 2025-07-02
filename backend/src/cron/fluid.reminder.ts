import cron from "node-cron";
import webpush from "web-push";
import { prisma } from "../lib/prisma";

const DAY_MS = 86_400_000;

webpush.setVapidDetails(
  "mailto:support@carbuddy.app",
  process.env.VAPID_PUBLIC!,
  process.env.VAPID_PRIVATE!
);

// ⏰ 07:30 UTC codziennie
cron.schedule("* * * * *", async () => {
  const due = await prisma.fluidCheckPlan.findMany({
    where: { nextCheck: { lte: new Date() }, enabled: true },
    include: { car: { select: { make: true, model: true, ownerId: true } } },
  });

  for (const plan of due) {
    const subs = await prisma.pushSubscription.findMany({
      where: { userId: plan.car.ownerId },
    });

    const payload = JSON.stringify({
      title: "CarBuddy – czas na płyny",
      body: `Sprawdź poziom płynów w ${plan.car.make} ${plan.car.model}.`,
    });

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { auth: s.auth, p256dh: s.p256dh } },
          payload
        );
      } catch (err: any) {
        // 410 = subskrypcja wygasła → usuń
        if (err.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { endpoint: s.endpoint },
          });
        }
      }
    }

    // przesuń następny termin
    await prisma.fluidCheckPlan.update({
      where: { id: plan.id },
      data: { nextCheck: new Date(Date.now() + plan.intervalDay * DAY_MS) },
    });
  }

  console.log(`[cron] Fluid reminders sent: ${due.length}`);
});
