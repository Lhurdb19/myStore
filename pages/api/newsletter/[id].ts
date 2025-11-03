import { connectDB } from "@/lib/db";
import Subscriber from "@/models/subscriber";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== "superadmin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await connectDB();
      await Subscriber.findByIdAndDelete(id);
      return res.status(200).json({ message: "Subscriber deleted" });
    } catch (err) {
      return res.status(500).json({ message: "Error deleting subscriber" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
