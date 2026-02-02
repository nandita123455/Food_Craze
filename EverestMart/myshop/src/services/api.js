import axios from 'axios';
import config from '../config/config';

// ✅ Use environment variable with fallback
const API_URL = config.API_BASE_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// Get auth token safely
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// UNIVERSAL API CALLER with error handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      ...options,
    };
    
    const { data } = await axios({
      url: `${API_URL}/${endpoint}`,
      ...config,
    });
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.response?.data || error.message);
    throw error;
  }
};

// Products
export const getProducts = async (filters) => {
  const { data } = await axios.get(`${API_URL}/products`, { params: filters });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/products/${id}`);
  return data;
};

// Auth Functions
export const register = async (userData) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/register`, userData);
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  const data = await apiCall('auth/profile');
  return data;
};

export const updateProfile = async (profileData) => {
  const data = await apiCall('auth/profile', {
    method: 'PUT',
    data: profileData,
  });
  if (data) localStorage.setItem('user', JSON.stringify(data));
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Safe user retrieval
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Orders & Payments
export const createOrder = (orderData) => apiCall('orders', { method: 'POST', data: orderData });
export const createPayU = (paymentData) => apiCall('payments/payu', { method: 'POST', data: paymentData });
export const createCOD = (orderData) => apiCall('payments/cod', { method: 'POST', data: orderData });
