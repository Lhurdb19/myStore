import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[]; // URLs
  stock: number;
  category?: string;
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  images: [String],
  stock: { type: Number, default: 0 },
  category: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
