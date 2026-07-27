import api from "./api";

export const createBooking = async ({ equipment, startDate, endDate, paymentMethod }) => {
  const response = await api.post("/booking", {
    equipment,
    startDate,
    endDate,
    paymentMethod: paymentMethod || "Cash",
  });

  return response?.data?.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/booking/my-bookings");
  return response?.data?.data || [];
};

export const getOwnerBookings = async () => {
  const response = await api.get("/booking/owner");
  return response?.data?.data || [];
};

export const cancelBooking = async (id) => {
  const response = await api.delete(`/booking/${id}`);
  return response?.data;
};

export const updateBookingStatus = async (id, status, paymentMethod, paymentStatus) => {
  const response = await api.put(`/booking/${id}/status`, { status, paymentMethod, paymentStatus });
  return response?.data?.data;
};
