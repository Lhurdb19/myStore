import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export function requireRole(role: "superadmin" | "admin") {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const session = await getSession({ req });
    if (!session || !session.user) return res.status(401).json({ message: "Not authenticated" });
    const userRole = (session.user as any).role;
    if (userRole !== role && (role === "superadmin")) {
      // only superadmin allowed
      return res.status(403).json({ message: "Forbidden" });
    }
    // admin route can be allowed for admin or superadmin if desired
    next();
  };
}
