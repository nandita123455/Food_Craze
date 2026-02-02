/**
 * URL Helper Utility
 * 
 * This file provides helper functions for constructing API URLs.
 * Import this in pages that still have hardcoded URLs.
 * 
 * Usage:
 *   import { getApiUrl, getAssetUrl, getSocketUrl } from '../utils/urlHelper';
 *   
 *   const response = await axios.get(getApiUrl('/products'));
 *   const imageUrl = getAssetUrl(product.image);
 *   const socket = io(getSocketUrl());
 */

import config from '../config/config.js';

/**
 * Get full API endpoint URL
 * @param {string} path - API path (e.g., '/products', '/auth/login')
 * @returns {string} Full API URL
 */
export const getApiUrl = (path) => {
    const endpoint = path.startsWith('/') ? path.substring(1) : path;
    return `${config.API_BASE_URL}/${endpoint}`;
};

/**
 * Get base API URL (for use with axios baseURL config)
 * @returns {string} Base API URL
 */
export const getBaseApiUrl = () => config.API_BASE_URL;

/**
 * Get asset URL (for images, uploads, etc.)
 * @param {string} path - Asset path
 * @returns {string} Full asset URL
 */
export const getAssetUrl = (path) => {
    return config.getAssetUrl(path);
};

/**
 * Get WebSocket server URL
 * @returns {string} Socket.IO server URL
 */
export const getSocketUrl = () => config.SOCKET_URL;

/**
 * Get backend base URL
 * @returns {string} Backend base URL
 */
export const getBackendUrl = () => config.API_URL;

export default {
    getApiUrl,
    getBaseApiUrl,
    getAssetUrl,
    getSocketUrl,
    getBackendUrl,
};
