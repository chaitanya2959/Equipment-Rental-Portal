import api from "./api";

export const getMyNotifications = async () => {
  const response = await api.get("/notifications");
  return response?.data?.data || [];
};

export const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response?.data?.count || 0;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response?.data;
};

export const markAllAsRead = async () => {
  const response = await api.put("/notifications/mark-all-read");
  return response?.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response?.data;
};
