import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const auth = {
  register: (email, password, fullName) =>
    api.post('/api/auth/register', { email, password, full_name: fullName }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  verify: () =>
    api.post('/api/auth/verify'),
};

// Users
export const users = {
  getMe: () => api.get('/api/users/me'),
  updateProfile: (fullName) =>
    api.put('/api/users/profile', { full_name: fullName }),
};

// Subscriptions
export const subscriptions = {
  getCurrent: () => api.get('/api/subscriptions'),
  getPlans: () => api.get('/api/subscriptions/plans'),
};

// Stripe
export const stripe = {
  checkout: (planType) =>
    api.post('/api/stripe/checkout', { planType }),
  getSubscription: () =>
    api.get('/api/stripe/subscription'),
};

// Social Accounts
export const socialAccounts = {
  list: () => api.get('/api/social-accounts'),
  connect: (platform, accessToken, accountName, profileUrl) =>
    api.post('/api/social-accounts/connect', {
      platform,
      access_token: accessToken,
      account_name: accountName,
      profile_url: profileUrl,
    }),
  disconnect: (id) =>
    api.delete(`/api/social-accounts/${id}`),
};

// Posts
export const posts = {
  list: (status, limit = 20, offset = 0) =>
    api.get('/api/posts', { params: { status, limit, offset } }),
  create: (title, content, mediaUrls, scheduledFor, platforms) =>
    api.post('/api/posts', {
      title,
      content,
      media_urls: mediaUrls,
      scheduled_for: scheduledFor,
      platforms,
    }),
  update: (id, title, content, mediaUrls, scheduledFor) =>
    api.put(`/api/posts/${id}`, {
      title,
      content,
      media_urls: mediaUrls,
      scheduled_for: scheduledFor,
    }),
  publish: (id) =>
    api.post(`/api/posts/${id}/publish`),
  delete: (id) =>
    api.delete(`/api/posts/${id}`),
};

export default api;
