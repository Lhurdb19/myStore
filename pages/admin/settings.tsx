import ChangePassword from "../changepassword-form";

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
      </form>
    </section>
  );
}
