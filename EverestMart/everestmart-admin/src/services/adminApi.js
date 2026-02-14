import axios from 'axios';
import config from '../config/config.js';

const API_URL = config.API_URL;

// ✅ Admin-specific axios instance
const adminAPI = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Add ADMIN token to requests (not regular token)
adminAPI.interceptors.request.use(
  (config) => {
    // Try adminToken first, then fall back to token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Handle admin auth errors - redirect to ADMIN login
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('❌ Admin session expired');
      localStorage.removeItem('admin');
      localStorage.removeItem('adminToken');
      // Redirect to admin login (not client login!)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =====================================
// ADMIN API METHODS
// =====================================

export const adminApi = {
  // =====================================
  // DASHBOARD
  // =====================================
  getDashboardStats: async () => {
    try {
      return await adminAPI.get('/admin/dashboard');
    } catch (error) {
      console.log('Dashboard stats endpoint not available');
      return { data: {} };
    }
  },

  // =====================================
  // ORDERS
  // =====================================
  getAllOrders: () => adminAPI.get('/admin/orders'),

  getOrderById: (orderId) => adminAPI.get(`/admin/orders/${orderId}`),

  updateOrderStatus: (orderId, status) =>
    adminAPI.put(`/admin/orders/${orderId}/status`, { status }),

  assignRider: (orderId, riderId) =>
    adminAPI.put(`/admin/orders/${orderId}/assign-rider`, { riderId }),

  // =====================================
  // PRODUCTS (Admin access to all products)
  // =====================================
  getAllProducts: () => adminAPI.get('/products'),

  getProductById: (id) => adminAPI.get(`/products/${id}`),

  createProduct: (formData) => adminAPI.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  updateProduct: (id, formData) => adminAPI.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  deleteProduct: (id) => adminAPI.delete(`/products/${id}`),

  // =====================================
  // CATEGORIES
  // =====================================
  getAllCategories: () => adminAPI.get('/categories'),

  createCategory: (category) => adminAPI.post('/categories', category),

  updateCategory: (id, category) => adminAPI.put(`/categories/${id}`, category),

  deleteCategory: (id) => adminAPI.delete(`/categories/${id}`),

  // =====================================
  // RIDERS
  // =====================================
  getAllRiders: () => adminAPI.get('/admin/riders'),

  getRiderById: (id) => adminAPI.get(`/admin/riders/${id}`),

  approveRider: (id) => adminAPI.put(`/admin/riders/${id}/status`, { status: 'approved' }),

  rejectRider: (id, reason) => adminAPI.put(`/admin/riders/${id}/status`, { status: 'rejected', rejectionReason: reason }),

  suspendRider: (riderId) => adminAPI.put(`/admin/riders/${riderId}/status`, { status: 'suspended' }),

  activateRider: (riderId) => adminAPI.put(`/admin/riders/${riderId}/status`, { status: 'approved' }),

  updateRiderStatus: (id, status) =>
    adminAPI.put(`/admin/riders/${id}/status`, { status }),

  // =====================================
  // USERS
  // =====================================
  getAllUsers: () => adminAPI.get('/admin/users'),

  getUserById: (id) => adminAPI.get(`/admin/users/${id}`),

  updateUser: (id, userData) => adminAPI.put(`/admin/users/${id}`, userData),

  deleteUser: (id) => adminAPI.delete(`/admin/users/${id}`),

  // =====================================
  // ANALYTICS (if you add later)
  // =====================================
  getRevenueStats: (params) => adminAPI.get('/admin/analytics/revenue', { params }),

  getOrderStats: (params) => adminAPI.get('/admin/analytics/orders', { params })
};

export default adminApi;
