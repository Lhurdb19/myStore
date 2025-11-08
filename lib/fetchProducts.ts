import axios from "axios";

const API_URL = "https://fakestoreapi.com/products/category"; // Example API

export const fetchProductsByCategory = async (category: string) => {
  const res = await axios.get(`${API_URL}/${category}`);
  return res.data.map((item: any) => ({
    id: item.id,
    name: item.title,
    price: item.price,
    imageUrl: item.image,
  }));
};
