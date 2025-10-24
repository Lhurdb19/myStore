import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  users: any[];
  refresh: () => void;
}

export default function UserTable({ users, refresh }: Props) {
  const updateUser = async (id: string, updates: any) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Admin added");
      refresh();
    } else {
        toast.error(data.message || "Error adding admin");
    }
  };

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3 capitalize">{u.role}</td>
              <td className="p-3">{u.status}</td>
              <td className="p-3 text-right space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    updateUser(u._id, {
                      role: u.role === "admin" ? "user" : "admin",
                    })
                  }
                >
                  {u.role === "admin" ? "Demote" : "Promote"}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() =>
                    updateUser(u._id, {
                      status: u.status === "active" ? "suspended" : "active",
                    })
                  }
                >
                  {u.status === "active" ? "Suspend" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
