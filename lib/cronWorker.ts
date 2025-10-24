// lib/cronWorker.ts
import cron from "node-cron";
import { connectDB } from "./db";
import Notification from "@/models/Notification";

/**
 * Run this function when your server starts (only if you have a persistent server).
 * It checks for scheduled notifications where sent === false and scheduledAt <= now,
 * marks them as sent and can trigger email/push logic.
 */
export async function startNotificationWorker() {
  await connectDB();

  // every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const due = await Notification.find({
        sent: false,
        scheduledAt: { $lte: now },
      });

      for (const n of due) {
        // Mark sent
        await Notification.findByIdAndUpdate(n._id, { $set: { sent: true } });

        // OPTIONAL: Trigger emails / push notifications for the audience here.
        // For email, fetch users and use your nodemailer helper.
      }
    } catch (e) {
      console.error("cron error", e);
    }
  });

  console.log("Notification worker started (node-cron).");
}
