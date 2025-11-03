import mongoose, { Schema, model, models } from "mongoose";

export interface ISettings {
  siteName: string;
  logo: string;
  emailServer: {
    host: string;
    port: number;
    user: string;
    pass: String,
  };
  security: {
    enable2FA: boolean;
    sessionTimeout: number; // in minutes
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, required: true, default: "ShopEase" },
    logo: { type: String, default: "/store.jpg" },
    emailServer: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      user: { type: String, default: "" },
    },
    security: {
      enable2FA: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
    },
  },
  { timestamps: true }
);

export default models.Settings || model<ISettings>("Settings", SettingsSchema);
