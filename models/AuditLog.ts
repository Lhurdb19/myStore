import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actor?: mongoose.Types.ObjectId;
  action: string;
  target?: string; // user id, product id, etc
  details?: string;
  ip?: string;
  category?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actor: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  target: String,
  details: Schema.Types.Mixed,
  category: {
      type: String,
      enum: ["auth", "payment", "user", "system", "admin", "other"],
      default: "system",
    },
  ip: String,
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
