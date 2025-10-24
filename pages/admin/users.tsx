export default function ManageUsers() {
  const users = [
    { name: "John Doe", email: "john@gmail.com", role: "user" },
    { name: "Jane Admin", email: "admin@gmail.com", role: "admin" },
  ];

  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
      <table className="w-full border-collapse bg-white shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={index} className="border-t">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3 capitalize">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
