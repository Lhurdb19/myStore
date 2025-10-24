"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Toaster, toast } from "sonner";

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  suspended: boolean;
  phone?: string;
  address?: string;
  createdAt: string;
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    phone: "",
    address: "",
  });

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admins");
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
      else toast.error("Failed to load admins");
    } catch {
      toast.error("Error fetching admins");
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspend = async (id: string, suspend: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}/suspend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Admin ${suspend ? "suspended" : "activated"} successfully`);
        fetchAdmins();
      } else toast.error(data.message || "Action failed");
    } catch {
      toast.error("Request failed");
    }
  };

  const changeRole = async (id: string, role: "user" | "admin") => {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Role updated to ${role}`);
        fetchAdmins();
      } else toast.error(data.message || "Failed to update role");
    } catch {
      toast.error("Request failed");
    }
  };

  const validatePhone = (phone: string) => {
    // Nigerian phone number format: +234XXXXXXXXXX or 0XXXXXXXXXX
    const regex = /^(?:\+234|0)[789]\d{9}$/;
    return regex.test(phone);
  };

  const handleAddAdmin = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
      toast.error("Please fill all fields");
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast.error("Invalid phone number format");
      return;
    }

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Admin created successfully");
        setAddOpen(false);
        setFormData({ name: "", email: "", password: "", role: "admin", phone: "", address: "" });
        fetchAdmins();
      } else toast.error(data.message || "Failed to create admin");
    } catch {
      toast.error("Error creating admin");
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading admins...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Manage Admins</h1>
        <Button onClick={() => setAddOpen(true)} className="bg-green-600 hover:bg-green-700">
          Add Admin
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin._id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.phone || "-"}</TableCell>
                <TableCell>{admin.address || "-"}</TableCell>
                <TableCell>
                  <Badge variant={admin.role === "superadmin" ? "destructive" : "secondary"}>
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {admin.suspended ? <Badge variant="outline">Suspended</Badge> :
                    <Badge className="bg-green-500 text-white">Active</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {admin.role !== "superadmin" && (
                        <>
                          <DropdownMenuItem onClick={() => changeRole(admin._id, admin.role === "admin" ? "user" : "admin")}>
                            {admin.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleSuspend(admin._id, !admin.suspended)}>
                            {admin.suspended ? "Activate" : "Suspend"}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Admin Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                placeholder="e.g., +2348012345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "user" | "admin" })}
                className="w-full border px-2 py-1 rounded-md"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAdmin} className="bg-green-600 hover:bg-green-700">Add Admin</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
