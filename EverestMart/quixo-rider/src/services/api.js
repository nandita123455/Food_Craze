import axios from 'axios';

// Update this with your computer's IP address
const API_URL = 'http://192.168.1.100:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const riderAPI = {
    // Auth
    login: (credentials) => api.post('/rider/login', credentials),

    // Profile & Stats
    getProfile: (token) => api.get('/rider/profile', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    getEarnings: (token) => api.get('/rider/earnings', {
        headers: { Authorization: `Bearer ${token}` }
    }),

    // Orders
    getOrders: (token) => api.get('/rider/orders', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    getAvailableOrders: (token) => api.get('/rider/available-orders', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    acceptOrder: (orderId, token) => api.post(`/rider/orders/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    markPickedUp: (orderId, token) => api.post(`/rider/orders/${orderId}/pickup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    generateOTP: (orderId, token) => api.post(`/rider/orders/${orderId}/generate-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    verifyDelivery: (orderId, otp, token) => api.post(`/rider/orders/${orderId}/verify-delivery`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
    ),

    // Availability
    updateAvailability: (isAvailable, token) => api.put('/rider/availability',
        { isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
    ),

    // Location
    updateLocation: (location, token) => api.put('/rider/location',
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
    ),
};

export default api;
