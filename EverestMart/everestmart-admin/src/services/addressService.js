import axios from 'axios';
import config from '../config/config.js';

const API_URL = config.API_URL;

// Get all saved addresses
export const getAddresses = async () => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get(`${API_URL}/addresses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

// Save new address
export const saveAddress = async (addressData) => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${API_URL}/addresses`, addressData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

// Delete address
export const deleteAddress = async (addressId) => {
  const token = localStorage.getItem('token');
  const { data } = await axios.delete(`${API_URL}/addresses/${addressId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};
