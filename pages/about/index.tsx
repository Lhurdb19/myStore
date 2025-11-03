"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface AboutSection {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
}

export default function AboutPage() {
  const [abouts, setAbouts] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbouts = async () => {
      try {
        const res = await fetch("/api/about");
        const data = await res.json();
        setAbouts(data);
      } catch (error) {
        console.error("Failed to load About content", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbouts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About ShopEase</h1>
        <p className="text-gray-600 text-lg">
          Your trusted destination for effortless online shopping, great deals, and quality products.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
        </div>
      ) : abouts.length === 0 ? (
        // 🟢 Default fallback when no content exists
        <Card className="max-w-4xl mx-auto bg-white shadow-md">
          <CardContent className="p-8 text-left space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to <strong>ShopEase</strong> — a next-generation eCommerce store built for
              convenience, affordability, and customer trust. We connect shoppers with high-quality
              products across categories including fashion, electronics, home appliances, and more.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              Our mission is simple — to make online shopping easy, secure, and enjoyable for
              everyone. At ShopEase, we focus on customer satisfaction, fast delivery, and top-notch
              product quality to ensure you always get the best value for your money.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6">Why Choose Us</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Curated product selection from trusted brands</li>
              <li>Fast, reliable delivery across Nigeria</li>
              <li>Secure payments and transparent pricing</li>
              <li>24/7 customer support for all your needs</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-6">
              Join thousands of satisfied shoppers today and experience the ease of shopping the
              <span className="font-semibold text-indigo-600"> ShopEase</span> way.
            </p>
          </CardContent>
        </Card>
      ) : (
        // 🟢 Render About sections from the database
        <div className="space-y-12 max-w-6xl mx-auto">
          {abouts.map((item, index) => (
            <Card
              key={item._id}
              className="overflow-hidden bg-white shadow-md hover:shadow-lg transition"
            >
              <div
                className={`grid md:grid-cols-2 gap-6 items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {item.imageUrl && (
                  <div className="w-full h-full">
                    <Image width={400} height={400}
                      src={item.imageUrl}
                      alt={item.title}
                      className="object-cover w-full h-80"
                    />
                  </div>
                )}

                <CardContent className="p-8 text-left">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h2>
                  <div
                    className="prose prose-lg text-gray-700 max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
