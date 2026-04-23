import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Global response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    if (error.response?.status === 429) {
      // Rate limit hit
      toast.error('Too many requests. Please slow down.');
      return Promise.reject(error);
    }

    // If backend returned field-level validation errors, show them all
    if (data?.errors && Array.isArray(data.errors)) {
      data.errors.forEach(e => toast.error(`${e.field}: ${e.message}`));
      return Promise.reject(error);
    }

    // Otherwise the individual pages handle their own errors
    return Promise.reject(error);
  }
);

export default API;