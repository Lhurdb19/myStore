// // lib/db.ts
// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI as string;

// if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

// let isConnected = false;

// export const connectDB = async () => {
//   if (isConnected) return;
//   try {
//     const db = await mongoose.connect(MONGODB_URI);
//     isConnected = !!db.connections[0].readyState;
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//   }
// };

// lib/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Please define MONGODB_URI in .env.local");
}

let cached = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "myStore",
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
