import { connectDB } from "@/lib/db";
import Subscriber from "@/models/subscriber";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== "superadmin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "DELETE") {
    try {
      await connectDB();
      await Subscriber.deleteMany({});
      return res.status(200).json({ message: "All subscribers deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
