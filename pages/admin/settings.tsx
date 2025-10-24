export default function AdminSettings() {
  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Admin Settings</h2>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 text-gray-700">Email Notifications</label>
          <select className="border rounded-md p-2 w-full">
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Change Password</label>
          <input
            type="password"
            placeholder="New Password"
            className="border rounded-md p-2 w-full"
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </section>
  );
}
