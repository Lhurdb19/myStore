import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { amount, email } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { amount: amount * 100, email },       // amount in kobo
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error(err.response?.data);
    return res.status(400).json({ message: "Paystack initialization failed", error: err.response?.data });
  }
}
