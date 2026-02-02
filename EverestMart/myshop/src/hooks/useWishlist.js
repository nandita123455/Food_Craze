// src/hooks/useWishlist.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const isRider = () => {
    const riderStr = localStorage.getItem('rider');
    return !!riderStr;
  };

  const fetchWishlist = async () => {
    // Don't fetch for riders
    if (isRider()) {
      console.log('⚠️ Skipping wishlist - user is rider');
      setWishlist([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(data || []);
    } catch (error) {
      console.error('❌ Wishlist error:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return {
    wishlist,
    loading,
    refreshWishlist: fetchWishlist
  };
}
