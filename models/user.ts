import mongoose, { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "user" | "admin" | "superadmin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  suspended?: boolean;
  emailVerified?: boolean;
  verificationToken?: string;
  otpCode?: string;
  otpVerified?: boolean;
  otpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  meta?: Record<string, any>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    suspended: { type: Boolean, default: false },
    meta: { type: Object },
    emailVerified: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },
    verificationToken: String,
    otpCode: String,
    otpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔍 Compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default models.User || model<IUser>("User", UserSchema);
