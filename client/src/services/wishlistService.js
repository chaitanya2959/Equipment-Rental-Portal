import api from "./api";

export const addToWishlist = async (equipment) => {
  const equipmentId = typeof equipment === "string" ? equipment : equipment?._id;
  const response = await api.post("/wishlist", { equipment: equipmentId });
  return response?.data?.data;
};

export const getMyWishlist = async () => {
  const response = await api.get("/wishlist");
  return response?.data?.data || [];
};

export const removeWishlistItem = async (id) => {
  const response = await api.delete(`/wishlist/${id}`);
  return response?.data;
};
