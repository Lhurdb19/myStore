import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tx_ref } = req.query;

  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${tx_ref}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (err: any) {
    res.status(400).json({ error: err.response?.data });
  }
}
