"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Mail, Phone } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { name, email, phone, address, subject, message } = form;
    if (!name || !email || !phone || !address || !subject || !message)
      return toast.error("All fields are required");

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send message");
      toast.success("Message sent successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        subject: "",
        message: "",
      });
    } catch {
      toast.error("Error sending message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-10">
        Contact <span className="text-green-600">Shop</span>Ease
      </h1>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-start bg-white shadow-lg rounded-2xl p-8">
        {/* Left - Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Get in Touch</h2>
          <p className="text-gray-600">
            Have questions, feedback, or partnership requests? Reach out — our
            team will respond promptly.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" />
              <p className="text-gray-700">123 Market Avenue, Lagos, Nigeria</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" />
              <a
                href="mailto:support@shopease.com"
                className="text-gray-700 hover:text-blue-600"
              >
                support@shopease.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" />
              <a href="tel:+2347012345678" className="text-gray-700 hover:text-blue-600">
                +234 701 234 5678
              </a>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Send us a Message</h3>
          <div className="space-y-4">
            <Input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} />
            <Input name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} />
            <Input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
            <Input name="address" placeholder="Your Address" value={form.address} onChange={handleChange} />
            <Input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} />
            <Textarea name="message" placeholder="Your Message..." rows={5} value={form.message} onChange={handleChange} />
            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mt-12 max-w-6xl mx-auto">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!..."
          width="100%"
          height="350"
          allowFullScreen
          loading="lazy"
          className="rounded-xl border-0 shadow-md"
        ></iframe>
      </div>
    </div>
  );
}
