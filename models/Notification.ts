// models/Notification.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "warning" | "critical";
  audience: "all" | "users" | "admins" | string; // can be user:id
  createdBy: mongoose.Schema.Types.ObjectId;
  scheduledAt?: Date;
  sent?: boolean;
  readBy?: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "critical"], required: true },
    audience: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date },
    sent: { type: Boolean, default: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default models.Notification || model<INotification>("Notification", NotificationSchema);
