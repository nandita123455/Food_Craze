/**
 * URL Helper Utility for Admin Panel
 * 
 * This file provides helper functions for constructing API URLs.
 * 
 * Usage:
 *   import { getApiUrl, getAssetUrl } from '../utils/urlHelper';
 *   
 *   const response = await axios.get(getApiUrl('/admin/orders'));
 *   const imageUrl = getAssetUrl(product.image);
 */

import config from '../config/config.js';

/**
 * Get full API endpoint URL
 * @param {string} path - API path (e.g., '/admin/orders')
 * @returns {string} Full API URL
 */
export const getApiUrl = (path) => {
    const endpoint = path.startsWith('/') ? path.substring(1) : path;
    return `${config.API_URL}/${endpoint}`;
};

/**
 * Get base API URL
 * @returns {string} Base API URL
 */
export const getBaseApiUrl = () => config.API_URL;

/**
 * Get asset URL (for images, uploads, etc.)
 * @param {string} path - Asset path
 * @returns {string} Full asset URL
 */
export const getAssetUrl = (path) => {
    return config.getAssetUrl(path);
};

/**
 * Get backend base URL
 * @returns {string} Backend base URL
 */
export const getBackendUrl = () => config.BACKEND_URL;

export default {
    getApiUrl,
    getBaseApiUrl,
    getAssetUrl,
    getBackendUrl,
};
