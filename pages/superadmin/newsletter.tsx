"use client";

import { connectDB } from "@/lib/db";
import Subscriber from "@/models/subscriber";
import { getSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 10;

export default function NewsletterPage({ subscribers = []}: { subscribers: { _id: string; email: string; createdAt: string }[] }) {
    const [subList, setSubList] = useState(subscribers || []);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSub, setSelectedSub] = useState<{ _id: string; email: string } | null>(null);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);

    const filteredSubscribers = useMemo(() => {
        if (!Array.isArray(subList)) return [];
        return subList.filter(sub =>
            sub.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, subList]);

    const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);
    const currentSubscribers = filteredSubscribers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const exportCSV = () => {
        setExporting(true);
        const header = ["Email", "Subscribed At"];
        const rows = filteredSubscribers.map(sub => [sub.email, new Date(sub.createdAt).toLocaleString()]);
        const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `newsletter_subscribers_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExporting(false);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete subscriber");
            setSubList(subList.filter(sub => sub._id !== id));
            toast.success("Subscriber deleted");
            setSelectedSub(null);
        } catch (err: any) {
            toast.error(err.message || "Error deleting subscriber");
        }
    };

    const handleDeleteAll = async () => {
        try {
            const res = await fetch(`/api/newsletter/all`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete all subscribers");
            setSubList([]);
            setDeleteAllOpen(false);
            toast.success("All subscribers deleted");
        } catch (err: any) {
            toast.error(err.message || "Error deleting all subscribers");
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Newsletter Subscribers</h1>

            <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />

            <button
                onClick={exportCSV}
                disabled={exporting || filteredSubscribers.length === 0}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
                {exporting ? "Exporting..." : "Export as CSV"}
            </button>

            <ul className="space-y-2">
                {currentSubscribers.length === 0 ? (
                    <li className="text-gray-500">No subscribers found.</li>
                ) : (
                    currentSubscribers.map((sub) => (
                        <li key={sub._id} className="border p-2 rounded-md flex justify-between items-center">
                            <div>
                                <span>{sub.email}</span>
                                <span className="ml-2 text-sm text-gray-500">{new Date(sub.createdAt).toLocaleString()}</span>
                            </div>

                            {/* Delete Button & Modal */}
                            <Dialog open={selectedSub?._id === sub._id} onOpenChange={() => setSelectedSub(null)}>
                                <DialogTrigger asChild>
                                    <button
                                        onClick={() => setSelectedSub(sub)}
                                        className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirm Delete</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete <strong>{sub.email}</strong> from the newsletter subscribers?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setSelectedSub(null)}>Cancel</Button>
                                        <Button variant="destructive" onClick={() => handleDelete(sub._id)}>Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            {/* Delete All Subscribers */}
                            {subList.length > 0 && (
                                <Dialog open={!!deleteAllOpen} onOpenChange={() => setDeleteAllOpen(false)}>
                                    <DialogTrigger asChild>
                                        <button
                                            onClick={() => setDeleteAllOpen(true)}
                                            className="mb-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        >
                                            Delete All Subscribers
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Confirm Delete All</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete <strong>all subscribers</strong> from the newsletter? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setDeleteAllOpen(false)}>Cancel</Button>
                                            <Button variant="destructive" onClick={handleDeleteAll}>Delete All</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                        </li>
                    ))
                )}
            </ul>

            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-2">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} onClick={() => goToPage(i + 1)} className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? "bg-green-600 text-white" : ""}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
}
