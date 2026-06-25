import api from "./axios";

export const getCommentsRequest = (postId, page = 1) =>
  api.get(`/comments/${postId}`, { params: { page } });
export const addCommentRequest = (postId, text) => api.post(`/comments/${postId}`, { text });
export const deleteCommentRequest = (id) => api.delete(`/comments/${id}`);
