// Central API base URL — reads from Vite env or falls back to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (method, path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send/receive HTTP-only cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
};

export const authApi = {
  register: (payload) => request('POST', '/auth/register', payload),
  login: (payload) => request('POST', '/auth/login', payload),
  googleAuth: (credential) => request('POST', '/auth/google', { credential }),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),
};

export const chatApi = {
  createChat: (payload) => request('POST', '/chat', payload),
  getChats: () => request('GET', '/chat'),
  getChatById: (chatId) => request('GET', `/chat/${chatId}`),
  sendMessage: (chatId, message) => request('POST', `/chat/${chatId}/message`, { message }),
  clearHistory: (chatId) => request('DELETE', `/chat/${chatId}/history`),
  deleteChat: (chatId) => request('DELETE', `/chat/${chatId}`),
  updateChat: (chatId, payload) => request('PATCH', `/chat/${chatId}`, payload),
};

export const userApi = {
  getProfile: () => request('GET', '/user/profile'),
  updateProfile: (payload) => request('PUT', '/user/profile', payload),
  skipOnboarding: () => request('POST', '/user/profile/skip-onboarding'),
  extractProfile: (text) => request('POST', '/user/profile/extract', { text }),
};

export const roadmapApi = {
  generate: (topic) => request('POST', '/roadmaps/generate', { topic }),
  getAll: () => request('GET', '/roadmaps'),
  getById: (id) => request('GET', `/roadmaps/${id}`),
  updateProgress: (id, sectionId, topicId, isCompleted) =>
    request('PATCH', `/roadmaps/${id}/progress`, { sectionId, topicId, isCompleted }),
  delete: (id) => request('DELETE', `/roadmaps/${id}`),
};

export const resourceApi = {
  search: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/resources?${query}`);
  },
  recommend: (payload) => request('POST', '/resources/recommend', payload),
  incrementViews: (id) => request('PATCH', `/resources/${id}`, { views: 1 }),
};

export const performanceApi = {
  getPerformance: () => request('GET', '/performance'),
};

export const progressApi = {
  getProgress: () => request('GET', '/progress'),
};

export const quizApi = {
  generate: (payload) => request('POST', '/quizzes/generate', payload),
  getAll: (page = 1, limit = 10) => request('GET', `/quizzes?page=${page}&limit=${limit}`),
  getById: (id) => request('GET', `/quizzes/${id}`),
  submit: (id, answers) => request('POST', `/quizzes/${id}/submit`, { answers }),
  delete: (id) => request('DELETE', `/quizzes/${id}`),
};
