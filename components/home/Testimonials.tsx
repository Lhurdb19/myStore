export default function Testimonials() {
  const feedbacks = [
    { name: "Aisha", comment: "Amazing quality, fast delivery!" },
    { name: "David", comment: "The best shopping experience ever!" },
    { name: "Fatima", comment: "Products were exactly as described. Love it!" },
  ];

  return (
    <section className="px-8 py-16 bg-white">
      <h2 className="text-3xl font-bold mb-6">💬 What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {feedbacks.map((fb, idx) => (
          <div key={idx} className="bg-gray-50 shadow p-6 rounded-lg text-center">
            <p className="italic text-gray-600">"{fb.comment}"</p>
            <h4 className="mt-4 font-semibold">- {fb.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}
