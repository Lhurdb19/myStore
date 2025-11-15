"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface WishlistItem {
    _id: string;
    title: string;
    images: string[];
    price: number;
    product: {
        _id: string;
        title: string;
        slug: string;
        price: number;
        images: string[];
    };
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    loading: boolean;
    addToWishlist: (product: any) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch wishlist on mount / session change
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!session?.user) return;
            setLoading(true);
            try {
                const res = await fetch("/api/wishlist");
                const data = await res.json();

                if (data.success && Array.isArray(data.wishlist)) {
                    setWishlist(
                        data.wishlist.map((item: any) => ({
                            _id: item._id,
                            title: item.title,
                            images: item.images,
                            price: item.price,
                            product: {
                                _id: item._id,
                                title: item.title,
                                slug: item.slug,
                                price: item.price,
                                images: item.images,
                            },
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load wishlist:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [session]);

    // Optimistically add to wishlist
    const addToWishlist = async (product: any) => {
        if (!session?.user) {
            toast.info("Please log in to use wishlist ❤️");
            return;
        }

        // Immediate optimistic update: wrap the product in `.product`
        setWishlist((prev) => [...prev, { _id: product._id, title: product.title, images: product.images, price: product.price, product }]);

        try {
            const res = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product._id }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.message || "Failed to add to wishlist");
                // safe filter with optional chaining
                setWishlist((prev) =>
                    prev.filter((item) => item.product?._id !== product._id)
                );
            } else {
                toast.success(`${product.title} added to wishlist ❤️`);
            }
        } catch {
            toast.error("Failed to add to wishlist");
            setWishlist((prev) =>
                prev.filter((item) => item.product?._id !== product._id)
            );
        }
    };


    // Optimistically remove from wishlist
    const removeFromWishlist = async (productId: string) => {
        // Find the product safely
        const productItem = wishlist.find((item) => item.product?._id === productId);
        if (!productItem) return;

        // Immediate optimistic update
        setWishlist((prev) => prev.filter((item) => item.product?._id !== productId));

        try {
            const res = await fetch("/api/wishlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.message || "Failed to remove");
                setWishlist((prev) => [...prev, productItem]);
            } else {
                toast.info(`${productItem.product.title} removed from wishlist 💔`);
            }
        } catch {
            toast.error("Failed to remove from wishlist");
            setWishlist((prev) => [...prev, productItem]);
        }
    };

    const isInWishlist = (productId: string) =>
        Array.isArray(wishlist) &&
        wishlist.some((item) => item.product?._id === productId);


    return (
        <WishlistContext.Provider
            value={{ wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
    return context;
};
