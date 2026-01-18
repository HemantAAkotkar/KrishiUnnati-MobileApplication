// app/api/productService.ts
import API from "./apiConfig";

export const addProduct = async (data, token) => {
  const res = await API.post("/products", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
