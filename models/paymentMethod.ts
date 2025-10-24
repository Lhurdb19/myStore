import mongoose, { Schema, model, models } from "mongoose";

export interface IPaymentMethod {
  name: string;
  provider: string;
  publicKey: string;
  secretKey: string;
  active: boolean;
  feePercent?: number;
  currency?: string;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: { type: String, required: true },
    provider: { type: String, required: true },
    publicKey: { type: String, required: true },
    secretKey: { type: String, required: true },
    active: { type: Boolean, default: true },
    feePercent: { type: Number, default: 0 },
    currency: { type: String, default: "NGN" },
  },
  { timestamps: true }
);

const PaymentMethod =
  models.PaymentMethod || model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);

export default PaymentMethod;
