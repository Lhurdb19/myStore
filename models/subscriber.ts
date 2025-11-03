import mongoose, { Schema, model, models } from "mongoose";

const subscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Subscriber = models.Subscriber || model("Subscriber", subscriberSchema);

export default Subscriber;
