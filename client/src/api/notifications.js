import api from "./axios";

export const getNotificationsRequest = (page = 1) =>
  api.get("/notifications", { params: { page } });
export const markAllReadRequest = () => api.put("/notifications/read-all");
export const markOneReadRequest = (id) => api.put(`/notifications/${id}/read`);
