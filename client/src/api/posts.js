import api from "./axios";

export const createPostRequest = (formData) =>
  api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getFeedRequest = (page = 1) => api.get("/posts/feed", { params: { page } });
export const getExploreRequest = (page = 1) => api.get("/posts/explore", { params: { page } });
export const getUserPostsRequest = (username, page = 1) =>
  api.get(`/posts/user/${username}`, { params: { page } });
export const getPostByIdRequest = (id) => api.get(`/posts/${id}`);
export const deletePostRequest = (id) => api.delete(`/posts/${id}`);
export const toggleLikeRequest = (id) => api.put(`/posts/${id}/like`);
export const toggleSaveRequest = (id) => api.put(`/posts/${id}/save`);
export const getSavedPostsRequest = () => api.get("/posts/saved/all");
