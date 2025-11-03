import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    // ✅ Create a new contact message
    if (req.method === "POST") {
      const { name, email, phone, address, subject, message } = req.body;

      if (!name || !email || !phone || !address || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const contact = new Contact({ name, email, phone, address, subject, message });
      await contact.save();

      return res.status(201).json({ message: "Message received successfully" });
    }

    // ✅ Get all contact messages
    if (req.method === "GET") {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return res.status(200).json(contacts);
    }

    // ✅ Delete a contact by ID
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "Contact ID is required" });
      }

      const deletedContact = await Contact.findByIdAndDelete(id);

      if (!deletedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      return res.status(200).json({ message: "Contact deleted successfully" });
    }

    // ❌ Method not allowed
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: any) {
    console.error("❌ Contact API Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
}
