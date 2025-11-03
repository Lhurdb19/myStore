"use client";

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { Toaster, toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin" | "vendor";
  suspended: boolean;
  createdAt: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || session.user.role !== "superadmin") {
    return {
      redirect: { destination: "/unauthorized", permanent: false },
    };
  }

  return { props: {} };
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Modals ---
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "user" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // --- Bulk selection ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- Search / Filter ---
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "user" | "admin" | "superadmin" | "vendor">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
      else toast.error("Failed to load users");
    } catch {
      toast.error("Error fetching users");
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
        toast.success(`User ${suspend ? "suspended" : "activated"} successfully`);
        fetchUsers();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch {
      toast.error("Request failed");
    }
  };

  const bulkAction = async (action: "suspend" | "activate" | "delete") => {
    if (!selectedIds.length) return toast.error("No users selected");

    if (action === "delete") {
      setBulkDeleteOpen(true);
      return;
    }

    try {
      for (const id of selectedIds) {
        await fetch(`/api/users/${id}/suspend`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspend: action === "suspend" }),
        });
      }
      toast.success("Bulk action completed");
      setSelectedIds([]);
      fetchUsers();
    } catch {
      toast.error("Bulk action failed");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User updated successfully");
        setEditOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Error updating user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading users...
      </div>
    );

  // --- Filtered & paginated users ---
  const filteredUsers = users
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter((u) => (filterRole === "all" ? true : u.role === filterRole))
    .filter((u) =>
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? !u.suspended
          : u.suspended
    );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(paginatedUsers.map((u) => u._id));
    else setSelectedIds([]);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {/* --- Search & Filters --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-1/3"
        />

        <div className="flex gap-2">
          <Select value={filterRole} onValueChange={(v) => setFilterRole(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">SuperAdmin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Bulk Actions --- */}
      {selectedIds.length > 0 && (
        <div className="flex gap-2 mb-2">
          <Button onClick={() => bulkAction("suspend")} className="cursor-pointer">Suspend Selected</Button>
          <Button onClick={() => bulkAction("activate")} className="cursor-pointer">Activate Selected</Button>
          <Button variant="destructive" onClick={() => bulkAction("delete")} className="cursor-pointer">Delete Selected</Button>
        </div>
      )}

      {/* --- Table --- */}
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>
                <input className="cursor-pointer"
                  type="checkbox"
                  checked={selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead className="text-gray-900 font-bold">Name</TableHead>
              <TableHead className="text-gray-900 font-bold">Email</TableHead>
              <TableHead className="text-gray-900 font-bold">Role</TableHead>
              <TableHead className="text-gray-900 font-bold">Status</TableHead>
              <TableHead className="text-gray-900 font-bold">Created</TableHead>
              <TableHead className="text-right text-gray-900 font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <input
                    type="checkbox" className="cursor-pointer"
                    checked={selectedIds.includes(user._id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedIds((prev) =>
                        checked ? [...prev, user._id] : prev.filter((id) => id !== user._id)
                      );
                    }}
                    disabled={user.role === "superadmin"}
                  />
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "superadmin" ? "destructive" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.suspended ? (
                    <Badge variant="outline">Suspended</Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleSuspend(user._id, !user.suspended)}
                        disabled={user.role === "superadmin"}
                      >
                        {user.suspended ? "Activate" : "Suspend"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteOpen(true);
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </Button>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      {/* --- Edit & Delete Modals --- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">SuperAdmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm sm:w-full">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete <span className="font-medium">{userToDelete?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!userToDelete) return;
                await fetch(`/api/users/${userToDelete._id}`, { method: "DELETE" });
                setDeleteOpen(false);
                fetchUsers();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Bulk Delete Confirmation Dialog --- */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-sm sm:w-full">
          <DialogHeader>
            <DialogTitle>Delete Selected Users</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{selectedIds.length}</span>{" "}
            selected user{selectedIds.length > 1 ? "s" : ""}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  for (const id of selectedIds) {
                    await fetch(`/api/users/${id}`, { method: "DELETE" });
                  }
                  toast.success("Selected users deleted");
                  setBulkDeleteOpen(false);
                  setSelectedIds([]);
                  fetchUsers();
                } catch {
                  toast.error("Failed to delete selected users");
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
