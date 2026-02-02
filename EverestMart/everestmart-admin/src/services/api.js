import axios from 'axios';
import config from '../config/config.js';

const API_URL = config.API_URL;

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('⚠️ Unauthorized - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ✅ SINGLE SOURCE OF TRUTH: Get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ UNIVERSAL API CALLER (handles ALL tokens)
export const apiCall = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    ...options
  };

  return axios({
    url: `${API_URL}${endpoint}`,
    ...config
  });
};

// =====================================
// PRODUCTS
// =====================================
export const getProducts = async (filters = {}) => {
  const { data } = await axios.get(`${API_URL}/products`, { params: filters });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/products/${id}`);
  return data;
};

// =====================================
// AUTH
// =====================================
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
  const { data } = await api.get('/auth/profile'); // ✅ Use api instance
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/profile', profileData); // ✅ Use api instance

  if (data) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rider');
  localStorage.removeItem('admin');
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// =====================================
// CART (✅ UPDATED to match your backend)
// =====================================
export const getCart = async () => {
  try {
    const { data } = await api.get('/cart');
    return data.cart || []; // ✅ Your backend returns { success: true, cart: [] }
  } catch (error) {
    console.error('Get cart error:', error);
    // Return empty cart if error
    return [];
  }
};

export const addToCart = async (productId, quantity = 1) => {
  const { data } = await api.post('/cart/add', { productId, quantity }); // ✅ /cart/add
  return data.cart || [];
};

export const updateCartItem = async (productId, quantity) => {
  const { data } = await api.put(`/cart/${productId}`, { quantity });
  return data.cart || [];
};

export const removeFromCart = async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data.cart || [];
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart/clear'); // ✅ /cart/clear (not just /cart)
  return data.cart || [];
};


// =====================================
// ORDERS
// =====================================
export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

// =====================================
// PAYMENTS
// =====================================
export const createPayU = async (paymentData) => {
  const { data } = await api.post('/payments/payu', paymentData);
  return data;
};

export const createCOD = async (orderData) => {
  const { data } = await api.post('/payments/cod', { orderData });
  return data;
};

// =====================================
// WISHLIST (BONUS)
// =====================================
export const getWishlist = async () => {
  const { data } = await api.get('/wishlist');
  return data;
};

export const addToWishlist = async (productId) => {
  const { data } = await api.post('/wishlist', { productId });
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data;
};

// =====================================
// ADDRESSES
// =====================================
export const getAddresses = async () => {
  const { data } = await api.get('/addresses');
  return data;
};

export const addAddress = async (addressData) => {
  const { data } = await api.post('/addresses', addressData);
  return data;
};

export const updateAddress = async (id, addressData) => {
  const { data } = await api.put(`/addresses/${id}`, addressData);
  return data;
};

export const deleteAddress = async (id) => {
  const { data } = await api.delete(`/addresses/${id}`);
  return data;
};

export default api;
