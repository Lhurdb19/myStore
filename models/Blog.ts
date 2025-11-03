import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  image: string;
  category: string;
  author: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    category: {
      type: String,
      enum: ["News", "Tips", "Announcements", "Tutorials", "Other"],
      default: "Other",
    },
    author: { type: String, default: "Admin" },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Blog || model<IBlog>("Blog", BlogSchema);
