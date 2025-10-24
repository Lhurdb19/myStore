"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toaster, toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Search, Copy, CreditCard } from "lucide-react";

interface IPaymentMethod {
  _id?: string;
  name: string;
  provider: string;
  publicKey: string;
  secretKey: string;
  active: boolean;
  createdAt?: string;
}

export default function PaymentMethodPage() {
  const [methods, setMethods] = useState<IPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<IPaymentMethod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<IPaymentMethod>({
    name: "",
    provider: "",
    publicKey: "",
    secretKey: "",
    active: true,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch("/api/admins/payment-methods");
      const data = await res.json();
      setMethods(data.methods || []);
    } catch (err) {
      toast.error("Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const method = editingMethod ? "PUT" : "POST";
    const body = editingMethod ? { id: editingMethod._id, ...form } : form;

    try {
      const res = await fetch("/api/admins/payment-methods", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchMethods();
        setDialogOpen(false);
        setEditingMethod(null);
        setForm({ name: "", provider: "", publicKey: "", secretKey: "", active: true });
        toast.success(editingMethod ? "Payment method updated!" : "Payment method added!");
      } else {
        toast.error("Failed to save payment method");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch("/api/admins/payment-methods", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget }),
      });
      if (res.ok) {
        fetchMethods();
        setDeleteTarget(null);
        toast.success("Payment method removed");
      } else {
        toast.error("Failed to delete payment method");
      }
    } catch {
      toast.error("Network issue");
    }
  };

  const toggleActive = async (id?: string, status?: boolean) => {
    if (!id) return;
    const res = await fetch(`/api/admins/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: status }),
    });
    if (res.ok) {
      fetchMethods();
      toast.success(
        `Payment method has been ${status ? "activated" : "deactivated"}.`
      );
    } else {
      toast.error("Failed to toggle method status");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  const filtered = methods.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center py-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* ✅ Sonner Toaster */}
      <Toaster richColors position="top-right" />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center w-full sm:w-auto border rounded-md px-3 py-1">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by name or provider"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus-visible:ring-0"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <CreditCard size={16} /> Add Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMethod ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input name="name" value={form.name} onChange={handleChange} /></div>
              <div><Label>Provider</Label><Input name="provider" value={form.provider} onChange={handleChange} /></div>
              <div><Label>Public Key</Label><Input name="publicKey" value={form.publicKey} onChange={handleChange} /></div>
              <div><Label>Secret Key</Label><Input name="secretKey" value={form.secretKey} onChange={handleChange} /></div>
              <Button className="w-full" onClick={handleSave}>{editingMethod ? "Update" : "Save"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Public Key</TableHead>
              <TableHead>Secret Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m._id}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.provider}</TableCell>
                <TableCell className="truncate max-w-[150px] flex items-center gap-2">
                  {m.publicKey}
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(m.publicKey, "Public key")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="truncate max-w-[150px] flex items-center gap-2">
                  {m.secretKey}
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(m.secretKey, "Secret key")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Switch checked={m.active} onCheckedChange={(checked) => toggleActive(m._id, checked)} />
                </TableCell>
                <TableCell>{new Date(m.createdAt || "").toLocaleDateString()}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => { setEditingMethod(m); setForm(m); setDialogOpen(true); }}>
                        ✏️ Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(m._id!)} className="text-red-600">
                        🗑 Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
