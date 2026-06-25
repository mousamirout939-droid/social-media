import api from "./axios";

export const getUserProfileRequest = (username) => api.get(`/users/${username}`);
export const updateProfileRequest = (data) => api.put("/users/profile", data);
export const updateAvatarRequest = (formData) =>
  api.put("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateCoverRequest = (formData) =>
  api.put("/users/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const toggleFollowRequest = (userId) => api.put(`/users/${userId}/follow`);
export const searchUsersRequest = (q) => api.get("/users/search", { params: { q } });
export const getSuggestionsRequest = () => api.get("/users/suggestions");
