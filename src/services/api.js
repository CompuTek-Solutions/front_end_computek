import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne pas rediriger si c'est la requête de connexion qui a échoué
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        useAuthStore.getState().logout();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Products
export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
};

// Inventory
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getLowStock: (threshold = 10) => api.get('/inventory/low-stock', { params: { threshold } }),
  update: (data) => api.put('/inventory', data),
  adjust: (data) => api.put('/inventory/adjust', data),
};

// Sales
export const salesAPI = {
  create: (data) => api.post('/sales', data),
  getAll: (params = {}) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  delete: (id) => api.delete(`/sales/${id}`),
  getStatistics: () => api.get('/sales/stats/overview'),
  getSellerStats: (seller_id) => api.get('/sales/stats/seller', { params: { seller_id } }),
};

// Users
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getAssignments: (seller_id) => api.get('/users/assignments', { params: { seller_id } }),
  assignProduct: (data) => api.post('/users/assignments', data),
  removeAssignment: (id) => api.delete(`/users/assignments/${id}`),
};

// Clients
export const clientAPI = {
  getAll: (params = {}) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export default api;
