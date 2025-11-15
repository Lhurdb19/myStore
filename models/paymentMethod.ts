// // import mongoose, { Schema, model, models } from "mongoose";

// // export interface IPaymentMethod {
// //   name: string;
// //   provider: string;
// //   publicKey: string;
// //   secretKey: string;
// //   active: boolean;
// //   feePercent?: number;
// //   currency?: string;
// // }

// // const PaymentMethodSchema = new Schema<IPaymentMethod>(
// //   {
// //     name: { type: String, required: true },
// //     provider: { type: String, required: true },
// //     publicKey: { type: String, required: true },
// //     secretKey: { type: String, required: true },
// //     active: { type: Boolean, default: true },
// //     feePercent: { type: Number, default: 0 },
// //     currency: { type: String, default: "NGN" },
// //   },
// //   { timestamps: true }
// // );

// // const PaymentMethod =
// //   models.PaymentMethod || model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);

// // export default PaymentMethod;


// import mongoose, { Schema, Document } from "mongoose";

// export interface IPayment extends Document {
//   name: string;
//   reference: string;
//   provider: string;
//   status: string;
//   amount: number;
//   currency: string;
//   customerEmail: string;
//   createdAt: Date;
// }

// const PaymentSchema = new Schema<IPayment>({
//   reference: { type: String, unique: true },
//   provider: { type: String },
//   status: { type: String, default: "pending" },
//   amount: { type: Number },
//   currency: { type: String, default: "NGN" },
//   customerEmail: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.Payment ||
//   mongoose.model<IPayment>("Payment", PaymentSchema);
