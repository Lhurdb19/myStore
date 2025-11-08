import axios from "axios";

export const fetchCategories = async () => {
  const res = await axios.get("/api/categories");
  return res.data.categories;
};
