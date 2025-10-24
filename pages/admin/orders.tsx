export default function ManageOrders() {
  const orders = [
    { id: "ORD123", customer: "John Doe", status: "Delivered" },
    { id: "ORD124", customer: "Mary Jane", status: "Pending" },
  ];

  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Orders</h2>
      <table className="w-full border-collapse bg-white shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Order ID</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, index) => (
            <tr key={index} className="border-t">
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.customer}</td>
              <td className="p-3">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
