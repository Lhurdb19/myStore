import mongoose, { Schema, model, models } from "mongoose";

export interface ISettings {
  siteName: string;
  logoUrl: string;
  emailServer: {
    host: string;
    port: number;
    user: string;
  };
  security: {
    enable2FA: boolean;
    sessionTimeout: number; // in minutes
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, required: true, default: "MyStore" },
    logoUrl: { type: String, required: true, default: "/logo.png" },
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
