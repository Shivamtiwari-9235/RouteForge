import axios from 'axios';

const fallbackBaseUrl = 'http://localhost:5000/api';
const baseURL = import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl;

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(`VITE_API_BASE_URL is not set. Falling back to ${fallbackBaseUrl}`);
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let refreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }).catch((err) => {
          // If refresh fails, redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          throw err;
        });
      }

      originalRequest._retry = true;
      refreshing = true;

      try {
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const token = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', token);
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear invalid tokens and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw refreshError;
      } finally {
        refreshing = false;
      }
    }
    throw error;
  }
);

api.interceptors.request.use((request) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  
  // For FormData requests, let the browser set Content-Type with boundary
  if (request.data instanceof FormData) {
    delete request.headers['Content-Type'];
  }
  
  return request;
});
