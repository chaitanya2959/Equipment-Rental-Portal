import api from "./api";

export const getMyReviews = async () => {
  const response = await api.get("/reviews/my-reviews");
  return response?.data?.data || [];
};

export const createReview = async ({ equipment, booking, rating, review }) => {
  const response = await api.post("/reviews", { equipment, booking, rating, review });
  return response?.data?.data;
};

export const updateReview = async (id, { rating, review }) => {
  const response = await api.put(`/reviews/${id}`, { rating, review });
  return response?.data?.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response?.data;
};
