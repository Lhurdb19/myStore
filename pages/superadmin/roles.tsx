"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Role {
  _id: string;
  name: string;
  description?: string;
  users: string[];
  permissions: string[];
}

const PERMISSIONS = ["view_users", "edit_users", "delete_users", "manage_roles", "view_reports"];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    users: [] as string[],
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admins/role");
      const data = await res.json();
      if (data.success) setRoles(data.roles);
    } catch {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admins");
      const data = await res.json();
      if (data.success) setUsers(data.admins);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const openModal = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setForm({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions,
        users: role.users,
      });
    } else {
      setSelectedRole(null);
      setForm({ name: "", description: "", permissions: [], users: [] });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async () => {
    try {
      const method = selectedRole ? "PUT" : "POST";
      const body = selectedRole
        ? { ...form, id: selectedRole._id, actor: "superadmin" }
        : { ...form, actor: "superadmin" };

      const res = await fetch("/api/admins/role", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Role ${selectedRole ? "updated" : "created"} successfully`);
        fetchRoles();
        closeModal();
      } else {
        toast.error(data.message || "Error saving role");
      }
    } catch {
      toast.error("Failed to save role");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster richColors position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Role
        </button>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="p-3">Role Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Users Assigned</th>
              <th className="p-3">Permissions</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Loading...</td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No roles found</td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{role.name}</td>
                  <td className="p-3">{role.description || "-"}</td>
                  <td className="p-3">{role.users.length}</td>
                  <td className="p-3">{role.permissions.join(", ")}</td>
                  <td className="p-3">
                    <button onClick={() => openModal(role)} className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-600 rounded-xl shadow-lg max-w-lg w-full p-6 relative">
            <h2 className="text-xl font-semibold mb-3">{selectedRole ? "Edit Role" : "Create Role"}</h2>

            <input
              type="text"
              placeholder="Role Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 rounded-md w-full mb-3"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border p-2 rounded-md w-full mb-3"
            />

            <div className="mb-3">
              <p className="font-semibold mb-1">Permissions:</p>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, permissions: [...form.permissions, perm] });
                        } else {
                          setForm({ ...form, permissions: form.permissions.filter(p => p !== perm) });
                        }
                      }}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="font-semibold mb-1">Assign Users:</p>
              <select
                multiple
                value={form.users}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                  setForm({ ...form, users: selected });
                }}
                className="border p-2 rounded-md w-full h-32"
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Save</button>
            </div>

            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
