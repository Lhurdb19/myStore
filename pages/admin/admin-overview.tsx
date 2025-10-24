export default function AdminOverview() {
  const stats = [
    { label: "Total Users", value: 240 },
    { label: "Active Orders", value: 52 },
    { label: "Delivered Orders", value: 178 },
    { label: "Revenue (₦)", value: "1.2M" },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg shadow-md p-4 text-center"
        >
          <h3 className="text-gray-700 text-sm">{stat.label}</h3>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
