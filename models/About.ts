import mongoose, { Schema, Document, models } from "mongoose";

export interface IAbout extends Document {
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AboutSchema = new Schema<IAbout>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default models.About || mongoose.model<IAbout>("About", AboutSchema);
