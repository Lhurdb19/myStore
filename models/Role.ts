import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: string[];
  users: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [String],
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
