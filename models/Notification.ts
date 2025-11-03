import mongoose, { Schema, Document, model, models } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "warning" | "critical";
  audience: "all" | "users" | "admins" | string;
  createdBy: mongoose.Schema.Types.ObjectId;
  category?: "system" | "product"; // ✅ add this line
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
    category: { type: String, enum: ["system", "product"], default: "system" },
    scheduledAt: { type: Date },
    sent: { type: Boolean, default: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// 🔹 Add virtual "id" field
NotificationSchema.virtual("id").get(function (this: { _id: mongoose.Types.ObjectId }) {
  return this._id.toString();
});

export default models.Notification || model<INotification>("Notification", NotificationSchema);
