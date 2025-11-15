import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Define cart types
interface CartItem {
  product: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  };
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

export function useCart() {
  const queryClient = useQueryClient();

  // Fetch cart
  const { data, isLoading, error } = useQuery<Cart>({
    queryKey: ["cart"], // ✅ Now TS knows this is a string array
    queryFn: async () => {
      const res = await axios.get("/api/cart");
      return res.data;
    },
  });

  // Add or update item
  const addToCart = useMutation<Cart, unknown, { productId: string; quantity: number }>({
    mutationFn: async ({ productId, quantity }) => {
      const res = await axios.put("/api/cart", { productId, quantity });
      return res.data;
    },
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
  });

  const updateCart = useMutation<Cart, unknown, { productId: string; quantity: number }>({
    mutationFn: async ({ productId, quantity }) => {
      const res = await axios.put("/api/cart", { productId, quantity, setExact: true });
      return res.data;
    },
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
  });

  const removeFromCart = useMutation<Cart, unknown, string>({
    mutationFn: async (productId) => {
      const res = await axios.delete(`/api/cart?productId=${productId}`);
      return res.data;
    },
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
  });

  const clearCart = useMutation<Cart>({
    mutationFn: async () => {
      const res = await fetch("/api/cart?clear=all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear cart");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["cart"]),
  });

  const isInCart = (productId: string) => {
    if (!data?.items) return false;
    return data.items.some((item) => item.product._id === productId);
  };

  return { data, isLoading, error, addToCart, updateCart, removeFromCart, clearCart, isInCart };
}
