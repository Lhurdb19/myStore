import mongoose, { Schema, Document, models } from "mongoose";

export interface IEmailHistory extends Document {
  email: string;
  subject: string;
  message: string;
  date: Date;
}

const EmailHistorySchema = new Schema<IEmailHistory>(
  {
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.EmailHistory ||
  mongoose.model<IEmailHistory>("EmailHistory", EmailHistorySchema);
