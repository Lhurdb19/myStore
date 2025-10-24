import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

export type LogCategory = "auth" | "payment" | "user" | "system" | "admin" | "other";

interface LogOptions {
  actor?: string | mongoose.Types.ObjectId;
  action: string;
  target?: string;
  details?: any;
  ip?: string;
  category?: LogCategory;
}

export async function logAction({
  actor,
  action,
  target,
  details,
  ip,
  category = "system",
}: LogOptions) {
  try {
    await connectDB();
    await AuditLog.create({
      actor,
      action,
      target,
      details,
      ip,
      category,
    });
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
}
