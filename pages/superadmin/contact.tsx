"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Trash2, User, MessageSquare } from "lucide-react";

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [replyModal, setReplyModal] = useState(false);
  const [replyEmail, setReplyEmail] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const fetchContacts = async () => {
    const res = await fetch("/api/contact");
    const data = await res.json();
    setContacts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/contact?id=${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted successfully");
      setDeleteId(null);
      fetchContacts();
    } else toast.error("Failed to delete");
  };

  const handleSendReply = async () => {
    if (!replyEmail || !replyMessage) return toast.error("All fields required");
    window.location.href = `mailto:${replyEmail}?subject=Re: ${replySubject}&body=${encodeURIComponent(replyMessage)}`;
    setReplyModal(false);
    toast.success("Reply opened in email client");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">
        Customer <span className="text-blue-600">Messages</span>
      </h1>

      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : contacts.length === 0 ? (
          <p className="text-center text-gray-600">No messages yet.</p>
        ) : (
          contacts.map((msg) => (
            <Card key={msg._id} className="shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="text-blue-600" /> {msg.subject}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </CardHeader>

              <CardContent className="p-5">
                <div className="flex justify-between flex-wrap">
                  <div className="text-gray-700">
                    <User className="inline text-blue-600 mr-2" />
                    {msg.name}
                  </div>
                  <a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline">
                    {msg.email}
                  </a>
                </div>

                <p className="mt-4 border-l-4 border-blue-200 pl-4 text-gray-700">
                  {msg.message}
                </p>

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => {
                    setReplyEmail(msg.email);
                    setReplySubject(msg.subject);
                    setReplyModal(true);
                  }}>
                    <Mail size={16} /> Reply
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteId(msg._id)}>
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Modal */}
      <Dialog open={replyModal} onOpenChange={setReplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={replyEmail} disabled />
            <Input value={replySubject} disabled />
            <Textarea
              placeholder="Write your reply..."
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <Button onClick={handleSendReply}>Send Reply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Popup */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Are you sure you want to delete this message?</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
