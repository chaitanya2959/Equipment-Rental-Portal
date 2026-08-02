import api from "./api";

export const getMyTickets = async () => {
  const response = await api.get("/support");
  return response?.data?.data || [];
};

export const createTicket = async ({ subject, category, bookingId, message }) => {
  const response = await api.post("/support", { subject, category, bookingId, message });
  return response?.data?.data;
};
